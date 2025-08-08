import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Campaign from '@/models/campaignModel';
import Call from '@/models/callModel';
import Contact from '@/models/contactModel';
import { getUserFromRequest } from '@/lib/jwt';
import { initiateCall } from '@/lib/elevenLabs';
import mongoose from 'mongoose';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`Campaign control API called for campaign ID: ${params.id}`);

    const userData = await getUserFromRequest(request);
    if (!userData || typeof userData === 'string') {
      console.log("Unauthorized campaign control attempt");
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { action } = body;
    console.log(`Campaign control action: ${action}`);

    if (!action || !['start', 'pause', 'resume', 'cancel'].includes(action)) {
      return NextResponse.json(
        { message: 'Invalid action. Must be one of: start, pause, resume, cancel' },
        { status: 400 }
      );
    }

    // Find the campaign
    const campaign = await Campaign.findOne({
      _id: params.id,
      userId: userData.userId
    }).populate('agentId');

    if (!campaign) {
      console.log(`Campaign not found: ${params.id}`);
      return NextResponse.json({ message: 'Campaign not found' }, { status: 404 });
    }

    console.log(`Found campaign: ${campaign.name}, status: ${campaign.status}`);

    let updateData: any = {};
    let message = '';
    let callDetails = null;

    switch (action) {
      case 'start':
        if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
          return NextResponse.json(
            { message: 'Can only start campaigns in draft or scheduled status' },
            { status: 400 }
          );
        }
        updateData = { status: 'in-progress' };
        message = 'Campaign started successfully';

        // Initiate calls directly
        try {
          console.log(`Starting campaign ${params.id} - preparing to initiate calls`);

          // Get contacts for this campaign
          const campaignContacts = campaign.contacts || [];
          console.log(`Campaign has ${campaignContacts.length} contacts`);

          // Define max concurrent calls
          const maxConcurrentCalls = campaign.maxConcurrentCalls || 1;
          console.log(`Max concurrent calls: ${maxConcurrentCalls}`);

          if (campaignContacts.length > 0) {
            // Process first batch of contacts (limited by maxConcurrentCalls)
            const contactsToProcess = campaignContacts.slice(0, maxConcurrentCalls);
            console.log(`Processing ${contactsToProcess.length} contacts out of ${campaignContacts.length}`);

            let initiated = 0;
            let failed = 0;
            const callResults = [];

            // Process each contact
            for (const contactId of contactsToProcess) {
              try {
                console.log(`Processing contact ID: ${contactId}`);

                // Find the contact
                const contact = await Contact.findById(contactId);
                if (!contact) {
                  console.log(`Contact not found: ${contactId}`);
                  failed++;
                  continue;
                }

                console.log(`Found contact: ${contact.name}, phone: ${contact.phoneNumber}`);

                // Get agent details
                const agentId = campaign.agentId?.agentId || campaign.agentId?.toString();
                if (!agentId) {
                  console.log(`No valid agent ID found for campaign ${campaign._id}`);
                  failed++;
                  continue;
                }

                // Get any custom message from the campaign
                const customMessage = campaign.customMessage;

                console.log(`Initiating call to ${contact.name} (${contact.phoneNumber}) with agent ${agentId}`);

                // Initiate the call with campaign ID
                const callResult = await initiateCall(
                  userData.userId as string,
                  agentId,
                  contact.phoneNumber,
                  contact.name || 'Customer',
                  customMessage,
                  campaign._id.toString()
                );

                console.log(`Call initiated successfully:`, callResult);
                callResults.push(callResult);

                // Update contact's lastContacted field
                await Contact.findByIdAndUpdate(contactId, {
                  lastContacted: new Date()
                });

                initiated++;
              } catch (error) {
                console.error('Error initiating call for contact:', contactId, error);
                failed++;
              }
            }

            // Update campaign stats
            await Campaign.findByIdAndUpdate(campaign._id, {
              $inc: {
                completedCalls: initiated
              }
            });

            console.log(`Campaign start - Initiated ${initiated} calls, ${failed} failed`);
            callDetails = {
              initiated,
              failed,
              callResults
            };
          } else {
            console.warn(`Campaign ${campaign._id} has no contacts to call`);
          }
        } catch (error) {
          console.error(`Error initiating calls for campaign ${campaign._id}:`, error);
          // Continue with campaign status update even if call initiation fails
        }
        break;

      case 'pause':
        if (campaign.status !== 'in-progress') {
          return NextResponse.json(
            { message: 'Can only pause campaigns that are in progress' },
            { status: 400 }
          );
        }
        updateData = { status: 'paused' };
        message = 'Campaign paused successfully';
        break;

      case 'resume':
        if (campaign.status !== 'paused') {
          return NextResponse.json(
            { message: 'Can only resume campaigns that are paused' },
            { status: 400 }
          );
        }
        updateData = { status: 'in-progress' };
        message = 'Campaign resumed successfully';

        // Similar to start, but only for remaining contacts
        try {
          console.log(`Resuming campaign ${params.id} - preparing to initiate calls`);

          const campaignContacts = campaign.contacts || [];
          console.log(`Campaign has ${campaignContacts.length} total contacts`);

          const maxConcurrentCalls = campaign.maxConcurrentCalls || 1;
          console.log(`Max concurrent calls: ${maxConcurrentCalls}`);

          if (campaignContacts.length > 0) {
            // Check existing calls to skip contacts that have already been called
            const existingCalls = await Call.find({ campaignId: campaign._id });
            console.log(`Found ${existingCalls.length} existing calls for this campaign`);

            // Create a set of contacted IDs (as strings for comparison)
            const calledContactIds = new Set();
            existingCalls.forEach(call => {
              if (call.contactId) {
                calledContactIds.add(call.contactId.toString());
              }
            });
            console.log(`${calledContactIds.size} contacts have already been called`);

            // Filter contacts that haven't been called yet
            const remainingContacts = [];
            for (const contactId of campaignContacts) {
              const contactIdStr = contactId.toString();
              if (!calledContactIds.has(contactIdStr)) {
                remainingContacts.push(contactId);
              }
            }

            console.log(`${remainingContacts.length} contacts remaining to be called`);

            if (remainingContacts.length === 0) {
              console.log(`No remaining contacts to call in campaign ${campaign._id}`);
              updateData.status = 'completed';
              message = 'Campaign completed - all contacts have been called';
              break;
            }

            // Process next batch of contacts
            const contactsToProcess = remainingContacts.slice(0, maxConcurrentCalls);
            console.log(`Processing ${contactsToProcess.length} remaining contacts`);

            let initiated = 0;
            let failed = 0;
            const callResults = [];

            // Process each contact
            for (const contactId of contactsToProcess) {
              try {
                console.log(`Processing contact ID: ${contactId}`);

                // Find the contact
                const contact = await Contact.findById(contactId);
                if (!contact) {
                  console.log(`Contact not found: ${contactId}`);
                  failed++;
                  continue;
                }

                console.log(`Found contact: ${contact.name}, phone: ${contact.phoneNumber}`);

                // Get agent details
                const agentId = campaign.agentId?.agentId || campaign.agentId?.toString();
                if (!agentId) {
                  console.log(`No valid agent ID found for campaign ${campaign._id}`);
                  failed++;
                  continue;
                }

                // Get any custom message from the campaign
                const customMessage = campaign.customMessage;

                console.log(`Initiating call to ${contact.name} (${contact.phoneNumber}) with agent ${agentId}`);

                // Initiate the call with campaign ID
                const callResult = await initiateCall(
                  userData.userId as string,
                  agentId,
                  contact.phoneNumber,
                  contact.name || 'Customer',
                  customMessage,
                  campaign._id.toString()
                );

                console.log(`Call initiated successfully:`, callResult);
                callResults.push(callResult);

                // Update contact's lastContacted field
                await Contact.findByIdAndUpdate(contactId, {
                  lastContacted: new Date()
                });

                initiated++;
              } catch (error) {
                console.error('Error initiating call for contact:', contactId, error);
                failed++;
              }
            }

            // Update campaign stats
            await Campaign.findByIdAndUpdate(campaign._id, {
              $inc: {
                completedCalls: initiated
              }
            });

            console.log(`Campaign resume - Initiated ${initiated} calls, ${failed} failed`);
            callDetails = {
              initiated,
              failed,
              callResults
            };
          } else {
            console.warn(`Campaign ${campaign._id} has no contacts to call`);
          }
        } catch (error) {
          console.error(`Error resuming calls for campaign ${campaign._id}:`, error);
        }
        break;

      case 'cancel':
        if (campaign.status === 'completed' || campaign.status === 'cancelled') {
          return NextResponse.json(
            { message: 'Cannot cancel campaigns that are already completed or cancelled' },
            { status: 400 }
          );
        }
        updateData = { status: 'cancelled' };
        message = 'Campaign cancelled successfully';
        break;
    }
    // Update the campaign at the end of the route
    const updatedCampaign = await Campaign.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(params.id) },
      { $set: updateData },
      { new: true }
    );

    return NextResponse.json({
      message,
      campaign: updatedCampaign,
      callDetails
    });
  } catch (error: any) {
    console.error(`Error controlling campaign:`, error);
    return NextResponse.json(
      { message: 'Failed to control campaign', error: error.message },
      { status: 500 }
    );
  }
}
