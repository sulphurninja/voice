import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Pipeline from '@/models/pipelineModel';
import Lead from '@/models/leadModel';
import { getUserFromRequest } from '@/lib/jwt';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    return NextResponse.json({ pipeline });
  } catch (error: any) {
    console.error('Error fetching pipeline:', error);
    return NextResponse.json(
      { message: 'Failed to fetch pipeline', error: error.message },
      { status: 500 }
    );
  }
}

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
    const { name, description, isDefault } = body;

    await connectDB();

    const pipeline = await Pipeline.findOne({
      _id: params.id,
      userId: userData.userId as string
    });

    if (!pipeline) {
      return NextResponse.json({ message: 'Pipeline not found' }, { status: 404 });
    }

    // If setting as default, remove default from other pipelines
    if (isDefault && !pipeline.isDefault) {
      await Pipeline.updateMany(
        { userId: userData.userId as string },
        { $set: { isDefault: false } }
      );
    }

    // Update pipeline
    pipeline.name = name || pipeline.name;
    pipeline.description = description !== undefined ? description : pipeline.description;
    pipeline.isDefault = isDefault !== undefined ? isDefault : pipeline.isDefault;

    await pipeline.save();

    return NextResponse.json({
      message: 'Pipeline updated successfully',
      pipeline
    });
  } catch (error: any) {
    console.error('Error updating pipeline:', error);
    return NextResponse.json(
      { message: 'Failed to update pipeline', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Check if there are leads in this pipeline
    const leadCount = await Lead.countDocuments({ pipelineId: params.id });
    if (leadCount > 0) {
      return NextResponse.json(
        { message: `Cannot delete pipeline. It contains ${leadCount} leads. Please move or delete the leads first.` },
        { status: 400 }
      );
    }

    await Pipeline.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Pipeline deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting pipeline:', error);
    return NextResponse.json(
      { message: 'Failed to delete pipeline', error: error.message },
      { status: 500 }
    );
  }
}
