import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/userModel';
import Agent from '@/models/agentModel';
import { getUserFromRequest } from '@/lib/jwt';

/**
 * Check if the user has reached their agent creation limit based on their plan
 */
export async function checkAgentCreationLimit(request: NextRequest) {
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

    // Count existing agents
    const agentCount = await Agent.countDocuments({ userId: userData.userId });

    // Check against plan limits
    if (agentCount >= user.agentsAllowed) {
      return NextResponse.json({
        message: `Your ${user.plan} plan allows a maximum of ${user.agentsAllowed} agents. Please upgrade your plan to create more agents.`,
        limit: user.agentsAllowed,
        current: agentCount
      }, { status: 403 });
    }

    // User has not reached their limit
    return null;
  } catch (error: any) {
    console.error('Error checking agent limits:', error);
    return NextResponse.json(
      { message: 'Failed to check plan limits', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Check if the user has enough minutes/credits for a call
 * Deducts from the wallet if needed and allowed
 */
export async function checkCallMinutesAvailable(userId: string, estimatedMinutes: number = 1) {
  try {
    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return {
        allowed: false,
        message: 'User not found',
        remainingMinutes: 0
      };
    }

    const remainingPlanMinutes = user.totalMinutes - user.minutesUsed;

    // If user has enough plan minutes, allow the call
    if (remainingPlanMinutes >= estimatedMinutes) {
      return {
        allowed: true,
        fromWallet: false,
        remainingMinutes: remainingPlanMinutes
      };
    }

    // Check if user can use wallet for extra minutes
    if (user.plan === 'starter') {
      return {
        allowed: false,
        message: 'You have used all your plan minutes. The Starter plan does not support extra minutes. Please upgrade your plan.',
        remainingMinutes: remainingPlanMinutes
      };
    }

    // For other plans, check wallet balance
    const minutesNeededFromWallet = estimatedMinutes - remainingPlanMinutes;
    const costInPaise = minutesNeededFromWallet * (user.extraMinuteRate || 0);

    if (user.walletBalance < costInPaise) {
      return {
        allowed: false,
        message: `Insufficient wallet balance. This call requires ₹${(costInPaise/100).toFixed(2)} from your wallet. Please recharge your wallet.`,
        remainingMinutes: remainingPlanMinutes,
        costInPaise: costInPaise,
        walletBalance: user.walletBalance
      };
    }

    // User can afford the call with wallet
    return {
      allowed: true,
      fromWallet: true,
      remainingMinutes: remainingPlanMinutes,
      walletMinutes: minutesNeededFromWallet,
      costInPaise: costInPaise
    };

  } catch (error: any) {
    console.error('Error checking call minutes:', error);
    return {
      allowed: false,
      message: 'Error checking call eligibility',
      error: error.message
    };
  }
}

/**
 * Update user's usage after a call
 */
export async function updateUserUsage(userId: string, minutesUsed: number, callCost: number = 0) {
  try {
    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // Calculate how many minutes come from plan vs wallet
    const remainingPlanMinutes = user.totalMinutes - user.minutesUsed;
    const minutesFromPlan = Math.min(remainingPlanMinutes, minutesUsed);
    const minutesFromWallet = Math.max(0, minutesUsed - minutesFromPlan);

    // Calculate wallet cost if applicable
    const walletCost = minutesFromWallet * (user.extraMinuteRate || 0);

    // Update the user's usage
    user.minutesUsed += minutesFromPlan;

    // Deduct from wallet if needed
    if (minutesFromWallet > 0 && user.plan !== 'starter') {
      user.walletBalance -= walletCost;
    }

    await user.save();

    return {
      success: true,
      minutesFromPlan,
      minutesFromWallet,
      walletCost,
      newTotalUsed: user.minutesUsed,
      newWalletBalance: user.walletBalance
    };

  } catch (error: any) {
    console.error('Error updating user usage:', error);
    return {
      success: false,
      message: 'Failed to update usage',
      error: error.message
    };
  }
}
