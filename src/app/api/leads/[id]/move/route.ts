import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Lead from '@/models/leadModel';
import Pipeline from '@/models/pipelineModel';
import { getUserFromRequest } from '@/lib/jwt';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData || typeof userData === 'string') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { newStageId, newPipelineId } = await request.json();

    if (!newStageId) {
      return NextResponse.json(
        { message: 'New stage ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const lead = await Lead.findOne({
      _id: params.id,
      userId: userData.userId as string
    });

    if (!lead) {
      return NextResponse.json(
        { message: 'Lead not found' },
        { status: 404 }
      );
    }

    // If moving to a different pipeline
    let targetPipelineId = lead.pipelineId;
    if (newPipelineId && newPipelineId !== lead.pipelineId.toString()) {
      targetPipelineId = newPipelineId;
    }

    // Validate the new stage exists in the target pipeline
    const pipeline = await Pipeline.findById(targetPipelineId);
    if (!pipeline) {
      return NextResponse.json(
        { message: 'Pipeline not found' },
        { status: 404 }
      );
    }

    const stage = pipeline.stages.find(s => s._id.toString() === newStageId);
    if (!stage) {
      return NextResponse.json(
        { message: 'Stage not found in pipeline' },
        { status: 404 }
      );
    }

    // Update lead
    lead.pipelineId = targetPipelineId;
    lead.stageId = newStageId;
    lead.lastActivity = new Date();

    // Add to stage history
    lead.stageHistory = lead.stageHistory || [];
    lead.stageHistory.push({
      stageId: newStageId,
      stageName: stage.name,
      movedAt: new Date(),
      movedBy: userData.userId as string,
    });

    await lead.save();

    // Return updated lead with populated fields
    const updatedLead = await Lead.findById(lead._id)
      .populate('contactId', 'name email phoneNumber company')
      .populate('pipelineId', 'name stages')
      .populate('assignedTo', 'name email');

    return NextResponse.json({
      message: 'Lead moved successfully',
      lead: updatedLead
    });
  } catch (error: any) {
    console.error('Error moving lead:', error);
    return NextResponse.json(
      { message: 'Failed to move lead', error: error.message },
      { status: 500 }
    );
  }
}
