import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Contact from '@/models/contactModel';
import Call from '@/models/callModel';
import Campaign from '@/models/campaignModel';
import { getUserFromRequest } from '@/lib/jwt';
import { initiateCall } from '@/lib/elevenLabs';

export async function POST(request: NextRequest) {
  try {
    console.log("Batch call endpoint hit");

    const userData = await getUserFromRequest(request);
    if (!userData || typeof userData === 'string') {
      console.log("Unauthorized batch call attempt");
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { agentId, contacts, campaignId, resuming = false } = body;

    console.log(`Batch call request received:`, {
      agentId,
      contactsCount: contacts?.length,
      campaignId,
      resuming
    });

    if (!agentId || !contacts || !Array.isArray(contacts) || contacts.length === 0) {
      console.log("Invalid batch call request - missing required fields");
      return NextResponse.json(
        { message: 'Agent ID and contacts array are required' },
        { status: 400 }
      );
    }

    // Initialize counters
    let initiated = 0;
    let failed = 0;
    let skipped = 0;
    const callResults = [];

    // If this is part of a campaign, apply concurrency limits
    let maxConcurrentCalls = 1; // Default to 1 if no campaign is specified
    let campaign = null;

    if (campaignId) {
      console.log(`Looking up campaign: ${campaignId}`);
      campaign = await Campaign.findOne({
        _id: campaignId,
        userId: userData.userId
      }).populate('agentId');

      if (campaign) {
        maxConcurrentCalls = campaign.maxConcurrentCalls || 1;
        console.log(`Campaign ${campaignId} found with max concurrent calls: ${maxConcurrentCalls}`);
      } else {
        console.log(`Campaign ${campaignId} not found`);
      }
    }

    // Process a batch of contacts
    const contactsToProcess = contacts.slice(0, maxConcurrentCalls);
    console.log(`Processing ${contactsToProcess.length} contacts out of ${contacts.length} total`);

    // If resuming, check which contacts have already been called
    let filteredContacts = contactsToProcess;
    if (resuming && campaignId) {
      console.log('Resuming campaign - checking for already called contacts');

      // Get all calls for this campaign
      const existingCalls = await Call.find({ campaignId });

      // Create a set of contacted IDs
      const calledContactIds = new Set();
      existingCalls.forEach(call => {
        if (call.contactId) {
          calledContactIds.add(call.contactId.toString());
        }
      });

      // Filter out already called contacts
      filteredContacts = contactsToProcess.filter(contactId =>
        !calledContactIds.has(contactId.toString())
      );

      console.log(`After filtering: ${filteredContacts.length} contacts to process`);
    }

    // Process each contact
    for (const contactId of filteredContacts) {
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

        // Get agent ID from campaign if available
        const effectiveAgentId = campaign?.agentId?.agentId || campaign?.agentId?._id?.toString() || agentId;

        // Get any custom message from the campaign
        const customMessage = campaign?.customMessage;

        console.log(`Initiating call to ${contact.name} (${contact.phoneNumber}) with agent ${effectiveAgentId}`);

        // Initiate the call with campaign ID if available
        const callResult = await initiateCall(
          userData.userId as string,
          effectiveAgentId,
          contact.phoneNumber,
          contact.name || 'Customer',
          customMessage,
          campaignId
        );

        console.log(`Call initiated successfully:`, callResult);

        // Update contact's lastContacted field
        await Contact.findByIdAndUpdate(contactId, {
          lastContacted: new Date()
        });

        // Store the call result
        callResults.push({
          ...callResult,
          contactName: contact.name,
          phoneNumber: contact.phoneNumber
        });

        initiated++;
      } catch (error) {
        console.error('Error initiating call for contact:', contactId, error);
        failed++;
      }
    }

    // Update campaign stats if applicable
    if (campaignId) {
      try {
        await Campaign.findByIdAndUpdate(campaignId, {
          $inc: {
            completedCalls: initiated
          }
        });
      } catch (error) {
        console.error('Error updating campaign stats:', error);
      }
    }

    console.log(`Batch call processing complete: initiated=${initiated}, failed=${failed}, skipped=${skipped}`);

    return NextResponse.json({
      message: `Initiated ${initiated} calls, ${failed} failed, ${skipped} skipped`,
      initiated,
      failed,
      skipped,
      totalContacts: contacts.length,
      processedContacts: contactsToProcess.length,
      remainingContacts: contacts.length - contactsToProcess.length,
      calls: callResults
    });
  } catch (error: any) {
    console.error('Error processing batch call initiation:', error);
    return NextResponse.json(
      { message: 'Failed to process batch calls', error: error.message },
      { status: 500 }
    );
  }
}
