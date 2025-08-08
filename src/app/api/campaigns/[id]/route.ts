import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Campaign from '@/models/campaignModel';
import Call from '@/models/callModel';
import { getUserFromRequest } from '@/lib/jwt';
import { initiateCall } from '@/lib/elevenLabs';
import Contact from '@/models/contactModel';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData || typeof userData === 'string') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const campaign = await Campaign.findOne({
      _id: params.id,
      userId: userData.userId
    }).populate('agentId', 'name');

    if (!campaign) {
      return NextResponse.json({ message: 'Campaign not found' }, { status: 404 });
    }

    // Get contacts for this campaign
    const contacts = await Contact.find({
      _id: { $in: campaign.contacts }
    }).sort({ name: 1 });

    // Fix the calls query
    const calls = await Call.find({
      campaignId: new mongoose.Types.ObjectId(params.id)
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      campaign,
      contacts,
      calls
    });
  } catch (error: any) {
    console.error('Error fetching campaign details:', error);
    return NextResponse.json(
      { message: 'Failed to fetch campaign details', error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData || typeof userData === 'string') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();

    // Find and update the campaign
    const campaign = await Campaign.findOneAndUpdate(
      { _id: params.id, userId: userData.userId },
      { $set: body },
      { new: true }
    );

    if (!campaign) {
      return NextResponse.json({ message: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Campaign updated successfully',
      campaign
    });
  } catch (error: any) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { message: 'Failed to update campaign', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData || typeof userData === 'string') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Fix the campaign query
    const campaign = await Campaign.findOne({
      _id: new mongoose.Types.ObjectId(params.id),
      userId: userData.userId
    }).populate('agentId', 'name');


    if (!campaign) {
      return NextResponse.json({ message: 'Campaign not found' }, { status: 404 });
    }

    // Only allow deletion of draft or completed campaigns
    if (campaign.status !== 'draft' && campaign.status !== 'completed' && campaign.status !== 'cancelled') {
      return NextResponse.json(
        { message: 'Cannot delete an active or scheduled campaign' },
        { status: 400 }
      );
    }

    await Campaign.deleteOne({ _id: params.id });

    return NextResponse.json({
      message: 'Campaign deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { message: 'Failed to delete campaign', error: error.message },
      { status: 500 }
    );
  }
}
