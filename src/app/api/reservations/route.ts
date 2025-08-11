import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Reservation from '@/models/reservationModel';
import { getUserFromRequest } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData || typeof userData === 'string') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const date = url.searchParams.get('date');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const query: any = { userId: userData.userId };
    
    if (status && status !== 'all') {
      if (status === 'today') {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        query.dateTime = { $gte: startOfDay, $lt: endOfDay };
      } else {
        query.status = status;
      }
    }

    if (date) {
      const selectedDate = new Date(date);
      const startOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      const endOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1);
      query.dateTime = { $gte: startOfDay, $lt: endOfDay };
    }

    const reservations = await Reservation.find(query)
      .sort({ dateTime: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('callId', 'conversationId summary');

    const total = await Reservation.countDocuments(query);

    return NextResponse.json({
      reservations,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { message: 'Failed to fetch reservations', error: error.message },
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

    const reservationData = await request.json();
    
    await connectDB();
    
    const reservation = await Reservation.create({
      ...reservationData,
      userId: userData.userId,
    });

    return NextResponse.json(reservation);
  } catch (error: any) {
    console.error('Error creating reservation:', error);
    return NextResponse.json(
      { message: 'Failed to create reservation', error: error.message },
      { status: 500 }
    );
  }
}