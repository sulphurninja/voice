import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Reservation from '@/models/reservationModel';
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

    const reservation = await Reservation.findOne({
      _id: params.id,
      userId: userData.userId
    }).populate('callId', 'conversationId summary transcription');

    if (!reservation) {
      return NextResponse.json({ message: 'Reservation not found' }, { status: 404 });
    }

    return NextResponse.json(reservation);
  } catch (error: any) {
    console.error('Error fetching reservation:', error);
    return NextResponse.json(
      { message: 'Failed to fetch reservation', error: error.message },
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

    const reservation = await Reservation.findOneAndUpdate(
      { _id: params.id, userId: userData.userId },
      updates,
      { new: true }
    );

    if (!reservation) {
      return NextResponse.json({ message: 'Reservation not found' }, { status: 404 });
    }

    return NextResponse.json(reservation);
  } catch (error: any) {
    console.error('Error updating reservation:', error);
    return NextResponse.json(
      { message: 'Failed to update reservation', error: error.message },
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

    const reservation = await Reservation.findOneAndDelete({
      _id: params.id,
      userId: userData.userId
    });

    if (!reservation) {
      return NextResponse.json({ message: 'Reservation not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Reservation deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting reservation:', error);
    return NextResponse.json(
      { message: 'Failed to delete reservation', error: error.message },
      { status: 500 }
    );
  }
}