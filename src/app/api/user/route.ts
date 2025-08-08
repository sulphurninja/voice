import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/userModel';
import { getUserFromRequest } from '@/lib/jwt';

export async function DELETE(request: NextRequest) {
  try {
    // Get the authenticated user
    const userData = await getUserFromRequest(request);
    if (!userData || !userData.userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Delete the user
    const result = await User.findByIdAndDelete(userData.userId);

    if (!result) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Account deleted successfully'
    });
  } catch (error: any) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { message: 'Failed to delete account', error: error.message },
      { status: 500 }
    );
  }
}
