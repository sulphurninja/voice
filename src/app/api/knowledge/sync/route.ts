import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { syncGlobalKnowledgeToAllAgents } from '@/lib/knowledgeSync';

export async function POST(request: NextRequest) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = typeof userData === 'object' ? userData.userId : userData;

    const result = await syncGlobalKnowledgeToAllAgents(userId);

    return NextResponse.json({
      message: 'Global knowledge sync completed',
      result,
    });
  } catch (error: any) {
    console.error('Error syncing global knowledge:', error);
    return NextResponse.json(
      { message: 'Failed to sync global knowledge', error: error.message },
      { status: 500 }
    );
  }
}
