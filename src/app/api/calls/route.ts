import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Call from '@/models/callModel';
import Contact from '@/models/contactModel';
import { getUserFromRequest } from '@/lib/jwt';
import { initiateCall } from '@/lib/elevenLabs';
import { parse } from 'csv-parse/sync';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData || typeof userData === 'string') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Parse query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    // Build query
    const query: any = { userId: userData.userId as string };

    if (status) {
      query.status = status;
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Execute query with pagination
    const totalCalls = await Call.countDocuments(query);
    const calls = await Call.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('agentId', 'name');

    return NextResponse.json({
      calls,
      pagination: {
        total: totalCalls,
        page,
        limit,
        pages: Math.ceil(totalCalls / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching calls:', error);
    return NextResponse.json(
      { message: 'Failed to fetch calls', error: error.message },
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

    const body = await request.json();
    const { agentId, phoneNumber, contactName, customMessage, contactId } = body;

    if (!agentId || !phoneNumber) {
      return NextResponse.json(
        { message: 'Agent ID and phone number are required' },
        { status: 400 }
      );
    }

    // Log attempt to help with debugging
    console.log("Call initiation attempt:", {
      userId: userData.userId,
      agentId,
      phoneNumber,
      contactName
    });

    // Improved call initiation with better phone formatting
    const result = await initiateCall(
      userData.userId as string,
      agentId,
      phoneNumber,
      contactName || 'Customer',
      customMessage
    );

    // If contactId is provided, update the contact's lastContacted field
    if (contactId) {
      await connectDB();
      await Contact.findByIdAndUpdate(contactId, {
        lastContacted: new Date()
      });
    }
    console.log("Call initiation result:", result);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error initiating call:', error);
    return NextResponse.json(
      { message: 'Failed to initiate call', error: error.message },
      { status: 500 }
    );
  }
}

// For bulk uploads via CSV
export async function PUT(request: NextRequest) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData || typeof userData === 'string') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const agentId = formData.get('agentId') as string;

    if (!file || !agentId) {
      return NextResponse.json(
        { message: 'File and agent ID are required' },
        { status: 400 }
      );
    }

    // Parse CSV file
    const buffer = Buffer.from(await file.arrayBuffer());
    const content = buffer.toString();

    const records = parse(content, {
      columns: true,
      skip_empty_lines: true
    });

    if (records.length === 0) {
      return NextResponse.json(
        { message: 'CSV file is empty or invalid' },
        { status: 400 }
      );
    }

    // Store contacts only, don't schedule calls at all
    await connectDB();
    const results = {
      created: 0,
      skipped: 0,
      failed: 0
    };
    const uploadedContacts = [];

    for (const record of records) {
      const name = record.name || record.Name || record.contactName || record.ContactName || '';
      const phoneNumber = record.phone || record.Phone || record.phoneNumber || record.PhoneNumber || '';

      if (!phoneNumber) {
        results.skipped++;
        continue;
      }

      // Clean the phone number
      const cleanedPhoneNumber = phoneNumber.startsWith('+')
        ? '+' + phoneNumber.substring(1).replace(/\D/g, '')
        : phoneNumber.replace(/\D/g, '');

      // Check if contact already exists
      let contact = await Contact.findOne({
        userId: userData.userId as string,
        phoneNumber: cleanedPhoneNumber
      });

      // Create contact if it doesn't exist
      if (!contact) {
        try {
          contact = await Contact.create({
            userId: userData.userId as string,
            name,
            phoneNumber: cleanedPhoneNumber,
            email: record.email || record.Email || '',
            company: record.company || record.Company || '',
            notes: record.notes || record.Notes || '',
            tags: record.tags ? record.tags.split(',').map((tag: string) => tag.trim()) : []
          });
        } catch (error) {
          console.error("Error creating contact:", error);
          results.failed++;
          continue;
        }
      }

      // Store the contact ID for later use
      uploadedContacts.push(contact._id.toString());
      results.created++;
    }

    console.log(`CSV Import: Processed ${records.length} contacts for campaign creation.`);

    return NextResponse.json({
      message: `Processed ${records.length} contacts from CSV.`,
      results,
      uploadedContacts,
      agentId,
      campaignReady: true // Flag to indicate we can create a campaign
    });
  } catch (error: any) {
    console.error('Error processing CSV:', error);
    return NextResponse.json(
      { message: 'Failed to process CSV', error: error.message },
      { status: 500 }
    );
  }
}
