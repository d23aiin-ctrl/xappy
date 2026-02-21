import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  createGoal,
  getActiveGoals,
  getAllGoals,
  updateGoalProgress,
  updateGoalStatus,
  suggestGoals,
  type GoalCategory,
  type GoalSource,
  type GoalStatus,
} from '@/lib/ai/session-goals';

/**
 * Session Goals API
 *
 * GET - Get user's goals
 * POST - Create a new goal
 * PUT - Update goal progress
 */

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as GoalStatus | null;
    const category = searchParams.get('category') as GoalCategory | null;
    const includeSuggestions = searchParams.get('suggestions') === 'true';

    const goals = status === 'active'
      ? await getActiveGoals(session.user.id)
      : await getAllGoals(session.user.id, {
          status: status || undefined,
          category: category || undefined,
        });

    let suggestions: any[] = [];
    if (includeSuggestions) {
      suggestions = await suggestGoals(session.user.id, {});
    }

    return NextResponse.json({
      success: true,
      data: {
        goals,
        suggestions: includeSuggestions ? suggestions : undefined,
      },
    });
  } catch (error) {
    console.error('Get goals error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, category, targetDate, milestones } = body;

    if (!title || !category) {
      return NextResponse.json(
        { error: 'Title and category are required' },
        { status: 400 }
      );
    }

    const goal = await createGoal(session.user.id, {
      title,
      description,
      category: category as GoalCategory,
      setBy: 'user' as GoalSource,
      targetDate: targetDate ? new Date(targetDate) : undefined,
      milestones,
    });

    return NextResponse.json({
      success: true,
      data: goal,
    });
  } catch (error) {
    console.error('Create goal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { goalId, progressPct, evidenceNote, milestoneId, milestoneCompleted, status } = body;

    if (!goalId) {
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 });
    }

    let goal;

    if (status) {
      // Update status
      goal = await updateGoalStatus(goalId, session.user.id, status as GoalStatus);
    } else {
      // Update progress
      goal = await updateGoalProgress(goalId, session.user.id, {
        progressPct,
        evidenceNote,
        milestoneId,
        milestoneCompleted,
      });
    }

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: goal,
    });
  } catch (error) {
    console.error('Update goal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
