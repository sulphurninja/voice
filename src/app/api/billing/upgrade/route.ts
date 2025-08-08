import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import connectDB from '@/lib/db';
import User from '@/models/userModel';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Remove the global Razorpay initialization
// const razorpay = new Razorpay({...}) - DELETE THIS

// Plan configurations
const plans = {
  starter: {
    price: 2499 * 100, // in paise
    minutes: 300,
    agents: 1,
    extraMinuteRate: null
  },
  growth: {
    price: 5999 * 100, // in paise
    minutes: 800,
    agents: 3,
    extraMinuteRate: 550 // ₹5.50 in paise
  },
  pro: {
    price: 11999 * 100, // in paise
    minutes: 1800,
    agents: 7,
    extraMinuteRate: 500 // ₹5.00 in paise
  },
  enterprise: {
    price: null, // Custom pricing
    minutes: 5000,
    agents: 15,
    extraMinuteRate: 450 // ₹4.50 in paise
  }
};

// Helper function to initialize Razorpay
function initializeRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || ''
  });
}

// Create an order for plan upgrade
export async function POST(request: NextRequest) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData || typeof userData === 'string') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(userData.userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { planId } = body;

    // Validate plan
    if (!planId || !plans[planId as keyof typeof plans]) {
      return NextResponse.json(
        { message: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // Don't allow downgrades
    const currentPlanIndex = Object.keys(plans).indexOf(user.plan);
    const newPlanIndex = Object.keys(plans).indexOf(planId);

    if (newPlanIndex < currentPlanIndex) {
      return NextResponse.json(
        { message: 'Plan downgrades are not supported through this API' },
        { status: 400 }
      );
    }

    // For enterprise, redirect to sales
    if (planId === 'enterprise') {
      return NextResponse.json({
        message: 'Please contact sales for Enterprise plan',
        contactSales: true
      });
    }

    const plan = plans[planId as keyof typeof plans];

    // Initialize Razorpay inside the function
    const razorpay = initializeRazorpay();

    // Generate a shorter receipt ID - max 40 chars
    const timestamp = Date.now().toString().slice(-8);  // Use last 8 digits only
    const receiptId = `plan-${userData.userId.slice(-8)}-${planId}-${timestamp}`;

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: plan.price as number,
      currency: 'INR',
      receipt: receiptId,
      notes: {
        userId: userData.userId,
        planId: planId,
        purpose: 'plan_upgrade'
      }
    });

    return NextResponse.json({ order, plan: planId });
  } catch (error: any) {
    console.error('Error creating plan upgrade order:', error);
    return NextResponse.json(
      { message: 'Failed to create plan upgrade order', error: error.message },
      { status: 500 }
    );
  }
}

// Verify payment and update plan
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
      planId
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

    // Validate plan
    if (!planId || !plans[planId as keyof typeof plans]) {
      return NextResponse.json(
        { message: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    await connectDB();

    const plan = plans[planId as keyof typeof plans];

    // Update user's plan
    const user = await User.findByIdAndUpdate(
      userData.userId,
      {
        plan: planId,
        totalMinutes: plan.minutes,
        agentsAllowed: plan.agents,
        extraMinuteRate: plan.extraMinuteRate,
        // Reset minutes used when upgrading to give full value
        minutesUsed: 0
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Create subscription record (you would need a subscription model)
    // For now, we'll just return the updated user plan

    return NextResponse.json({
      message: 'Plan upgraded successfully',
      plan: user.plan,
      totalMinutes: user.totalMinutes,
      agentsAllowed: user.agentsAllowed,
      extraMinuteRate: user.extraMinuteRate
    });
  } catch (error: any) {
    console.error('Error verifying plan upgrade:', error);
    return NextResponse.json(
      { message: 'Failed to verify plan upgrade', error: error.message },
      { status: 500 }
    );
  }
}