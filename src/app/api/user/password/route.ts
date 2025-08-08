import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/userModel';
import { getUserFromRequest } from '@/lib/jwt';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
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

    // Get the current and new password from the request
    const { currentPassword, newPassword } = await request.json();

    // Find the user by ID and include the password field
    const user = await User.findById(userData.userId).select('+password');
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Verify the current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Update the password
    user.password = newPassword;
    await user.save();

    return NextResponse.json({
      message: 'Password updated successfully'
    });
  } catch (error: any) {
    console.error('Password update error:', error);
    return NextResponse.json(
      { message: 'Failed to update password', error: error.message },
      { status: 500 }
    );
  }
}
