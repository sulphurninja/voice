import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Pipeline from '@/models/pipelineModel';
import Lead from '@/models/leadModel';
import { getUserFromRequest } from '@/lib/jwt';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; stageId: string } }
) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData || typeof userData === 'string') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, color } = body;

    await connectDB();

    const pipeline = await Pipeline.findOne({
      _id: params.id,
      userId: userData.userId as string
    });

    if (!pipeline) {
      return NextResponse.json({ message: 'Pipeline not found' }, { status: 404 });
    }

    // Find and update the stage
    const stageIndex = pipeline.stages.findIndex(
      stage => stage._id.toString() === params.stageId
    );

    if (stageIndex === -1) {
      return NextResponse.json({ message: 'Stage not found' }, { status: 404 });
    }

    if (name) pipeline.stages[stageIndex].name = name;
    if (color) pipeline.stages[stageIndex].color = color;

    await pipeline.save();

    return NextResponse.json({
      message: 'Stage updated successfully',
      stages: pipeline.stages
    });
  } catch (error: any) {
    console.error('Error updating stage:', error);
    return NextResponse.json(
      { message: 'Failed to update stage', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; stageId: string } }
) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData || typeof userData === 'string') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const pipeline = await Pipeline.findOne({
      _id: params.id,
      userId: userData.userId as string
    });

    if (!pipeline) {
      return NextResponse.json({ message: 'Pipeline not found' }, { status: 404 });
    }

    // Can't delete if it's the only stage
    if (pipeline.stages.length === 1) {
      return NextResponse.json(
        { message: 'Cannot delete the only stage in a pipeline' },
        { status: 400 }
      );
    }

    // Find the stage to delete
    const stageIndex = pipeline.stages.findIndex(
      stage => stage._id.toString() === params.stageId
    );

    if (stageIndex === -1) {
      return NextResponse.json({ message: 'Stage not found' }, { status: 404 });
    }

    // Move any leads in this stage to the first stage
    const firstStage = pipeline.stages.find(stage => stage._id.toString() !== params.stageId);
    if (firstStage) {
      await Lead.updateMany(
        { pipelineId: params.id, stageId: params.stageId },
        {
          $set: { stageId: firstStage._id },
          $push: {
            stageHistory: {
              stageId: firstStage._id,
              stageName: firstStage.name,
              movedAt: new Date(),
              movedBy: userData.userId as string,
            }
          }
        }
      );
    }

    // Remove the stage
    pipeline.stages.splice(stageIndex, 1);

    // Reorder remaining stages
    pipeline.stages.forEach((stage, index) => {
      stage.order = index;
    });

    await pipeline.save();

    return NextResponse.json({
      message: 'Stage deleted successfully',
      stages: pipeline.stages
    });
  } catch (error: any) {
    console.error('Error deleting stage:', error);
    return NextResponse.json(
      { message: 'Failed to delete stage', error: error.message },
      { status: 500 }
    );
  }
}
