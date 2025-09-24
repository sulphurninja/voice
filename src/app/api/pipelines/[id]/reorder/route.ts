import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
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

    const body = await request.json();
    const { stages } = body;

    if (!stages || !Array.isArray(stages)) {
      return NextResponse.json(
        { message: 'Stages array is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const pipeline = await Pipeline.findOne({
      _id: params.id,
      userId: userData.userId as string
    });

    if (!pipeline) {
      return NextResponse.json({ message: 'Pipeline not found' }, { status: 404 });
    }

    // Update the stages with new order
    pipeline.stages = stages;
    await pipeline.save();

    return NextResponse.json({
      message: 'Stages reordered successfully',
      stages: pipeline.stages
    });
  } catch (error: any) {
    console.error('Error reordering stages:', error);
    return NextResponse.json(
      { message: 'Failed to reorder stages', error: error.message },
      { status: 500 }
    );
  }
}
