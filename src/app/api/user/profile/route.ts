import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/userModel';
import { getUserFromRequest } from '@/lib/jwt';

export async function PATCH(request: NextRequest) {
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

    // Get the updated profile data
    const { name, email, phoneNumber, company } = await request.json();

    // Find the user by ID
    const user = await User.findById(userData.userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if email is being changed and if it's unique
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { message: 'Email already in use' },
          { status: 400 }
        );
      }
    }

    // Update the user details
    user.name = name;
    user.email = email;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (company !== undefined) user.company = company;

    await user.save();

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan
      }
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { message: 'Failed to update profile', error: error.message },
      { status: 500 }
    );
  }
}
