import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Pipeline from '@/models/pipelineModel';
import { getUserFromRequest } from '@/lib/jwt';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData || typeof userData === 'string') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, color, order } = body;

    if (!name || !color) {
      return NextResponse.json(
        { message: 'Stage name and color are required' },
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

    // Add new stage
    const newStage = {
      name,
      color,
      order: order !== undefined ? order : pipeline.stages.length
    };

    pipeline.stages.push(newStage);
    await pipeline.save();

    return NextResponse.json({
      message: 'Stage added successfully',
      stages: pipeline.stages
    });
  } catch (error: any) {
    console.error('Error adding stage:', error);
    return NextResponse.json(
      { message: 'Failed to add stage', error: error.message },
      { status: 500 }
    );
  }
}
