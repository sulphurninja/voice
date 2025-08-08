import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import connectDB from '@/lib/db';
import User from '@/models/userModel';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

// Create an order for recharging wallet
export async function POST(request: NextRequest) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData || typeof userData === 'string') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get user to check plan
    const user = await User.findById(userData.userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Only allow recharges for plans above starter
    if (user.plan === 'starter') {
      return NextResponse.json(
        { message: 'Wallet recharges are only available for Growth, Pro, and Enterprise plans' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { amount } = body; // Amount in INR

    // Validate amount (minimum ₹500)
    if (!amount || amount < 500) {
      return NextResponse.json(
        { message: 'Minimum recharge amount is ₹500' },
        { status: 400 }
      );
    }

    // Convert to paise for Razorpay
    const amountInPaise = Math.round(amount * 100);

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `wallet-${userData.userId}-${Date.now()}`,
      notes: {
        userId: userData.userId,
        purpose: 'wallet_recharge'
      }
    });

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error('Error creating wallet recharge:', error);
    return NextResponse.json(
      { message: 'Failed to create wallet recharge', error: error.message },
      { status: 500 }
    );
  }
}

// Verify payment and update wallet balance
export async function PUT(request: NextRequest) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData || typeof userData === 'string') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount
    } = body;

    // Verify the payment signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { message: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    await connectDB();

    // Update wallet balance (amount is in paise)
    const user = await User.findByIdAndUpdate(
      userData.userId,
      { $inc: { walletBalance: amount } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Create transaction record (you'll need to create a transaction model)
    // For now, we'll just return the updated wallet balance

    return NextResponse.json({
      message: 'Wallet recharged successfully',
      walletBalance: user.walletBalance
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { message: 'Failed to verify payment', error: error.message },
      { status: 500 }
    );
  }
}

// Get wallet balance and transaction history
export async function GET(request: NextRequest) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData || typeof userData === 'string') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(userData.userId).select('walletBalance plan minutesUsed totalMinutes extraMinuteRate');

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // You can add transaction history fetching logic here

    return NextResponse.json({
      walletBalance: user.walletBalance,
      plan: user.plan,
      minutesUsed: user.minutesUsed,
      totalMinutes: user.totalMinutes,
      extraMinuteRate: user.extraMinuteRate
    });
  } catch (error: any) {
    console.error('Error fetching wallet data:', error);
    return NextResponse.json(
      { message: 'Failed to fetch wallet data', error: error.message },
      { status: 500 }
    );
  }
}
