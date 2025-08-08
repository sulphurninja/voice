import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Contact from '@/models/contactModel';
import { getUserFromRequest } from '@/lib/jwt';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

export async function GET(request: NextRequest) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Parse query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search');
    const tag = url.searchParams.get('tag');

    // Build query
    const query: any = { userId: typeof userData === 'object' ? userData.userId : userData };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    if (tag) {
      query.tags = tag;
    }

    // Execute query with pagination
    const totalContacts = await Contact.countDocuments(query);
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      contacts,
      pagination: {
        total: totalContacts,
        page,
        limit,
        pages: Math.ceil(totalContacts / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { message: 'Failed to fetch contacts', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phoneNumber, email, company, notes, tags } = body;

    if (!name || !phoneNumber) {
      return NextResponse.json(
        { message: 'Name and phone number are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if contact already exists
    const existingContact = await Contact.findOne({
      userId: typeof userData === 'object' ? userData.userId : userData,
      phoneNumber
    });

    if (existingContact) {
      return NextResponse.json(
        { message: 'Contact with this phone number already exists' },
        { status: 400 }
      );
    }

    // Create contact
    const contact = await Contact.create({
      userId: typeof userData === 'object' ? userData.userId : userData,
      name,
      phoneNumber,
      email,
      company,
      notes,
      tags: tags || []
    });

    return NextResponse.json(contact);
  } catch (error: any) {
    console.error('Error creating contact:', error);
    return NextResponse.json(
      { message: 'Failed to create contact', error: error.message },
      { status: 500 }
    );
  }
}

// Import contacts from CSV
export async function PUT(request: NextRequest) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { message: 'CSV file is required' },
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

    // Import contacts
    await connectDB();
    const results = {
      created: 0,
      skipped: 0,
      failed: 0,
      details: [] as any[]
    };

    for (const record of records) {
      const name = record.name || record.Name || '';
      const phoneNumber = record.phone || record.Phone || record.phoneNumber || record.PhoneNumber || '';

      if (!name || !phoneNumber) {
        results.skipped++;
        results.details.push({
          record,
          status: 'skipped',
          reason: 'Missing name or phone number'
        });
        continue;
      }

      try {
        // Check if contact already exists
        const existingContact = await Contact.findOne({
          userId: typeof userData === 'object' ? userData.userId : userData,
          phoneNumber
        });

        if (existingContact) {
          results.skipped++;
          results.details.push({
            record,
            status: 'skipped',
            reason: 'Contact already exists'
          });
          continue;
        }

        // Create contact
        await Contact.create({
          userId: typeof userData === 'object' ? userData.userId : userData,
          name,
          phoneNumber,
          email: record.email || record.Email || '',
          company: record.company || record.Company || '',
          notes: record.notes || record.Notes || '',
          tags: record.tags ? record.tags.split(',').map((tag: string) => tag.trim()) : []
        });

        results.created++;
        results.details.push({
          record,
          status: 'created'
        });
      } catch (error: any) {
        results.failed++;
        results.details.push({
          record,
          status: 'failed',
          reason: error.message
        });
      }
    }

    return NextResponse.json({
      message: `Imported ${results.created} contacts (${results.skipped} skipped, ${results.failed} failed)`,
      results
    });
  } catch (error: any) {
    console.error('Error importing contacts:', error);
    return NextResponse.json(
      { message: 'Failed to import contacts', error: error.message },
      { status: 500 }
    );
  }
}

// Export contacts as CSV
export async function PATCH(request: NextRequest) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get all contacts for the user
    const contacts = await Contact.find({ userId: typeof userData === 'object' ? userData.userId : userData });

    // Format contacts for CSV
    const csvData = contacts.map(contact => ({
      Name: contact.name,
      PhoneNumber: contact.phoneNumber,
      Email: contact.email || '',
      Company: contact.company || '',
      Notes: contact.notes || '',
      Tags: contact.tags ? contact.tags.join(', ') : '',
      LastContacted: contact.lastContacted ? contact.lastContacted.toISOString() : ''
    }));

    // Generate CSV
    const csv = stringify(csvData, {
      header: true
    });

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="contacts.csv"'
      }
    });
  } catch (error: any) {
    console.error('Error exporting contacts:', error);
    return NextResponse.json(
      { message: 'Failed to export contacts', error: error.message },
      { status: 500 }
    );
  }
}
