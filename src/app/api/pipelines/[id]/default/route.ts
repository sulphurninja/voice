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

    await connectDB();

    // Remove default from all pipelines for this user
    await Pipeline.updateMany(
      { userId: userData.userId as string },
      { $set: { isDefault: false } }
    );

    // Set this pipeline as default
    const pipeline = await Pipeline.findOneAndUpdate(
      {
        _id: params.id,
        userId: userData.userId as string
      },
      { $set: { isDefault: true } },
      { new: true }
    );

    if (!pipeline) {
      return NextResponse.json({ message: 'Pipeline not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Default pipeline updated successfully',
      pipeline
    });
  } catch (error: any) {
    console.error('Error setting default pipeline:', error);
    return NextResponse.json(
      { message: 'Failed to set default pipeline', error: error.message },
      { status: 500 }
    );
  }
}
