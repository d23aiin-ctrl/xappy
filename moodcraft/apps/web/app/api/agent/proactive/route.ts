import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { runProactiveAnalysis } from '@/lib/ai/agent-orchestrator';

export const runtime = 'nodejs';
export const maxDuration = 30;

// GET proactive insights and recommendations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await runProactiveAnalysis(session.user.id);

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Proactive analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to run proactive analysis' },
      { status: 500 }
    );
  }
}
