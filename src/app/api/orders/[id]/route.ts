import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/orderModel';
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

    const order = await Order.findOne({
      _id: params.id,
      userId: userData.userId
    }).populate('callId', 'conversationId summary transcription');

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { message: 'Failed to fetch order', error: error.message },
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

    const updates = await request.json();
    await connectDB();

    const order = await Order.findOneAndUpdate(
      { _id: params.id, userId: userData.userId },
      {
        ...updates,
        ...(updates.status === 'confirmed' && { confirmedAt: new Date() }),
        ...(updates.status === 'ready' && { readyAt: new Date() }),
        ...(updates.status === 'delivered' && { completedAt: new Date() }),
      },
      { new: true }
    );

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { message: 'Failed to update order', error: error.message },
      { status: 500 }
    );
  }
}