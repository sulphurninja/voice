import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Pipeline from '@/models/pipelineModel';
import { getUserFromRequest } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData || typeof userData === 'string') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const pipelines = await Pipeline.find({
      userId: userData.userId as string
    }).sort({ isDefault: -1, createdAt: -1 });

    return NextResponse.json({ pipelines });
  } catch (error: any) {
    console.error('Error fetching pipelines:', error);
    return NextResponse.json(
      { message: 'Failed to fetch pipelines', error: error.message },
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
    const { name, description, stages, isDefault = false } = body;

    if (!name || !stages || !Array.isArray(stages) || stages.length === 0) {
      return NextResponse.json(
        { message: 'Pipeline name and stages are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // If this is set as default, remove default from other pipelines
    if (isDefault) {
      await Pipeline.updateMany(
        { userId: userData.userId as string },
        { $set: { isDefault: false } }
      );
    }

    const pipeline = await Pipeline.create({
      userId: userData.userId as string,
      name,
      description,
      stages: stages.map((stage: any, index: number) => ({
        name: stage.name,
        color: stage.color || '#3b82f6',
        order: index,
      })),
      isDefault,
    });

    return NextResponse.json({
      message: 'Pipeline created successfully',
      pipeline,
    });
  } catch (error: any) {
    console.error('Error creating pipeline:', error);
    return NextResponse.json(
      { message: 'Failed to create pipeline', error: error.message },
      { status: 500 }
    );
  }
}
