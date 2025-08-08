import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Campaign from '@/models/campaignModel';
import { getUserFromRequest } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData || typeof userData === 'string') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Parse query parameters for pagination
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');

    // Build query
    const query: any = { userId: userData.userId as string };
    if (status) {
      query.status = status;
    }

    // Execute query with pagination
    const totalCampaigns = await Campaign.countDocuments(query);
    const campaigns = await Campaign.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('agentId', 'name');

    return NextResponse.json({
      campaigns,
      pagination: {
        total: totalCampaigns,
        page,
        limit,
        pages: Math.ceil(totalCampaigns / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { message: 'Failed to fetch campaigns', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData || typeof userData === 'string') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.agentId || !body.contacts || !Array.isArray(body.contacts)) {
      return NextResponse.json(
        { message: 'Campaign name, agent ID, and contacts array are required' },
        { status: 400 }
      );
    }

    // Create new campaign
    const campaign = await Campaign.create({
      userId: userData.userId,
      name: body.name,
      description: body.description || "",
      agentId: body.agentId,
      contacts: body.contacts,
      customMessage: body.customMessage || "",
      scheduledStartTime: body.scheduledStartTime || null,
      scheduledEndTime: body.scheduledEndTime || null,
      dailyStartTime: body.dailyStartTime || "09:00",
      dailyEndTime: body.dailyEndTime || "17:00",
      maxConcurrentCalls: body.maxConcurrentCalls || 1,
      callsBetweenPause: body.callsBetweenPause || null,
      pauseDuration: body.pauseDuration || null,
      totalContacts: body.contacts.length,
    });

    return NextResponse.json({
      message: 'Campaign created successfully',
      campaign
    });
  } catch (error: any) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { message: 'Failed to create campaign', error: error.message },
      { status: 500 }
    );
  }
}
