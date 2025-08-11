import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import MenuItem from '@/models/menuModel';
import { getUserFromRequest } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData || typeof userData === 'string') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const available = url.searchParams.get('available');
    
    const query: any = { userId: userData.userId };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (available !== null) {
      query.available = available === 'true';
    }

    const items = await MenuItem.find(query).sort({ category: 1, name: 1 });

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { message: 'Failed to fetch menu items', error: error.message },
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

    const itemData = await request.json();
    
    await connectDB();
    
    const menuItem = await MenuItem.create({
      ...itemData,
      userId: userData.userId,
    });

    return NextResponse.json(menuItem);
  } catch (error: any) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { message: 'Failed to create menu item', error: error.message },
      { status: 500 }
    );
  }
}