import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Lead from '@/models/leadModel';
import Contact from '@/models/contactModel';
import Pipeline from '@/models/pipelineModel';
import { getUserFromRequest } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData || typeof userData === 'string') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const url = new URL(request.url);
    const pipelineId = url.searchParams.get('pipelineId');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    // Build query
    const query: any = { userId: userData.userId as string };
    if (pipelineId) {
      query.pipelineId = pipelineId;
    }

    const totalLeads = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .populate('contactId', 'name email phoneNumber company')
      .populate('pipelineId', 'name stages')
      .populate('assignedTo', 'name email')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      leads,
      pagination: {
        total: totalLeads,
        page,
        limit,
        pages: Math.ceil(totalLeads / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { message: 'Failed to fetch leads', error: error.message },
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
    const {
      name,
      email,
      phoneNumber,
      company,
      jobTitle,
      value,
      source,
      priority = 'medium',
      pipelineId,
      stageId,
      expectedCloseDate,
      notes,
      tags,
      createContact = false
    } = body;

    if (!name || !phoneNumber || !pipelineId || !stageId) {
      return NextResponse.json(
        { message: 'Name, phone number, pipeline, and stage are required' },
        { status: 400 }
      );
    }

    await connectDB();

    let contactId = null;

    // Create contact if requested
    if (createContact) {
      const existingContact = await Contact.findOne({
        userId: userData.userId as string,
        phoneNumber
      });

      if (!existingContact) {
        const newContact = await Contact.create({
          userId: userData.userId as string,
          name,
          email: email || '',
          phoneNumber,
          company: company || '',
          notes: notes || '',
          tags: tags || []
        });
        contactId = newContact._id;
      } else {
        contactId = existingContact._id;
      }
    }

    // Get pipeline and stage info
    const pipeline = await Pipeline.findById(pipelineId);
    if (!pipeline) {
      return NextResponse.json(
        { message: 'Pipeline not found' },
        { status: 404 }
      );
    }

    const stage = pipeline.stages.find(s => s._id.toString() === stageId);
    if (!stage) {
      return NextResponse.json(
        { message: 'Stage not found' },
        { status: 404 }
      );
    }

    // Create lead
    const lead = await Lead.create({
      userId: userData.userId as string,
      contactId,
      pipelineId,
      stageId,
      name,
      email,
      phoneNumber,
      company,
      jobTitle,
      value: value || 0,
      source,
      priority,
      notes,
      tags: tags || [],
      expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
      stageHistory: [{
        stageId,
        stageName: stage.name,
        movedAt: new Date(),
        movedBy: userData.userId as string,
      }]
    });

    // Populate the created lead
    const populatedLead = await Lead.findById(lead._id)
      .populate('contactId', 'name email phoneNumber company')
      .populate('pipelineId', 'name stages')
      .populate('assignedTo', 'name email');

    return NextResponse.json({
      message: 'Lead created successfully',
      lead: populatedLead
    });
  } catch (error: any) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { message: 'Failed to create lead', error: error.message },
      { status: 500 }
    );
  }
}
