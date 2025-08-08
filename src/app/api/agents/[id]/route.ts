import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Agent from '@/models/agentModel';
import { getUserFromRequest } from '@/lib/jwt';
import { getAgent, updateAgent, deleteAgent } from '@/lib/elevenLabs';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData || typeof userData === 'string') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Verify the agent belongs to the user
    const agent = await Agent.findOne({
      agentId: params.id,
      userId: userData.userId as string
    });

    if (!agent) {
      return NextResponse.json({ message: 'Agent not found' }, { status: 404 });
    }

    // Get detailed info from ElevenLabs
    const agentDetails = await getAgent(params.id);

    return NextResponse.json(agentDetails);
  } catch (error: any) {
    console.error('Error fetching agent:', error);
    return NextResponse.json(
      { message: 'Failed to fetch agent', error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData || typeof userData === 'string') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Verify the agent belongs to the user
    const agent = await Agent.findOne({
      agentId: params.id,
      userId: userData.userId as string
    });

    if (!agent) {
      return NextResponse.json({ message: 'Agent not found' }, { status: 404 });
    }

    const updates = await request.json();
    const updatedAgent = await updateAgent(params.id, updates);

    return NextResponse.json(updatedAgent);
  } catch (error: any) {
    console.error('Error updating agent:', error);
    return NextResponse.json(
      { message: 'Failed to update agent', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData || typeof userData === 'string') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Verify the agent belongs to the user
    const agent = await Agent.findOne({
      agentId: params.id,
      userId: userData.userId as string
    });

    if (!agent) {
      return NextResponse.json({ message: 'Agent not found' }, { status: 404 });
    }

    await deleteAgent(params.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting agent:', error);
    return NextResponse.json(
      { message: 'Failed to delete agent', error: error.message },
      { status: 500 }
    );
  }
}
