import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/userModel';
import crypto from 'crypto';
import { sendEmail } from '@/lib/sendEmail';
import { createResetPasswordEmailTemplate } from '@/lib/resetPasswordTemplate';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email } = await request.json();

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // For security reasons, we still return success even if user not found
      // This prevents email enumeration attacks
      return NextResponse.json(
        { message: 'If your email is registered, you will receive reset instructions.' },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Save the hashed token in the database with expiry (30 minutes)
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordExpire = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();

    // Create reset URL
    const resetUrl = `https://ai.Wow.com/reset-password?token=${resetToken}`;

    // Create email content with the template
    const username = user.firstName || user.email.split('@')[0];
    const html = createResetPasswordEmailTemplate(username, resetUrl);

    // Send the email
    await sendEmail({
      to: user.email,
      subject: 'Wow - Password Reset Request',
      text: `Reset your password by clicking on the following link: ${resetUrl}`,
      html
    });

    return NextResponse.json({
      message: 'If your email is registered, you will receive reset instructions.'
    }, { status: 200 });

  } catch (error: any) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { message: 'There was an error processing your request. Please try again.' },
      { status: 500 }
    );
  }
}
