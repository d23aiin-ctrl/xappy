import { NextRequest, NextResponse } from 'next/server';
import { getActiveUserIds, processUserBatch } from '@/lib/ai/proactive-agent';

// This endpoint should be called by a cron job (e.g., Vercel Cron, GitHub Actions)
// Recommended schedule: Every 6 hours

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Proactive Agent] Starting batch processing...');

    // Get active users
    const userIds = await getActiveUserIds(100);
    console.log(`[Proactive Agent] Found ${userIds.length} active users`);

    // Process users and create nudges
    const nudgesCreated = await processUserBatch(userIds);

    console.log(`[Proactive Agent] Created ${nudgesCreated} nudges`);

    return NextResponse.json({
      success: true,
      data: {
        usersProcessed: userIds.length,
        nudgesCreated,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[Proactive Agent] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to run proactive agent' },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggering with specific users
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userIds } = body;

    if (!userIds || !Array.isArray(userIds)) {
      return NextResponse.json(
        { error: 'userIds array required' },
        { status: 400 }
      );
    }

    const nudgesCreated = await processUserBatch(userIds);

    return NextResponse.json({
      success: true,
      data: {
        usersProcessed: userIds.length,
        nudgesCreated,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[Proactive Agent] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process users' },
      { status: 500 }
    );
  }
}
