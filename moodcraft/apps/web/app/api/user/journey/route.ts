import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getUserJourney,
  completeMilestone,
  checkGraduationCriteria,
  calculateWellnessScore,
  graduateUser,
} from '@/lib/ai/user-journey';
import prisma from '@/lib/prisma';

/**
 * User Journey API
 *
 * GET - Get user's journey status
 * POST - Complete a milestone or graduate
 */

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const includeWellnessUpdate = searchParams.get('updateWellness') === 'true';
    const includeCriteria = searchParams.get('criteria') === 'true';

    // Get journey
    const journey = await getUserJourney(session.user.id);

    // Optionally recalculate wellness score
    if (includeWellnessUpdate) {
      await calculateWellnessScore(session.user.id);
    }

    // Get available milestones for current stage
    const availableMilestones = await prisma.journeyMilestone.findMany({
      where: {
        stage: journey.currentStage,
        isActive: true,
      },
      orderBy: { order: 'asc' },
    });

    // Get graduation criteria if requested
    let graduationCriteria;
    if (includeCriteria) {
      graduationCriteria = await checkGraduationCriteria(session.user.id);
    }

    // Map milestones with completion status
    const milestonesWithStatus = availableMilestones.map((m) => ({
      id: m.slug,
      name: m.name,
      description: m.description,
      category: m.category,
      isRequired: m.isRequired,
      completed: journey.milestonesCompleted.some((cm) => cm.id === m.slug),
      completedAt: journey.milestonesCompleted.find((cm) => cm.id === m.slug)?.completedAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        journey: {
          currentStage: journey.currentStage,
          stageStartedAt: journey.stageStartedAt,
          wellnessScore: journey.wellnessScore,
          wellnessHistory: journey.wellnessHistory.slice(-30), // Last 30 data points
          graduationEligible: journey.graduationEligible,
          graduatedAt: journey.graduatedAt,
          totalMilestones: journey.milestonesCompleted.length,
        },
        milestones: milestonesWithStatus,
        graduationCriteria: includeCriteria ? graduationCriteria : undefined,
      },
    });
  } catch (error) {
    console.error('Get journey error:', error);
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
    const { action, milestoneId, graduationNotes } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    switch (action) {
      case 'complete_milestone': {
        if (!milestoneId) {
          return NextResponse.json({ error: 'Milestone ID is required' }, { status: 400 });
        }

        const result = await completeMilestone(session.user.id, milestoneId);

        return NextResponse.json({
          success: true,
          data: {
            journey: result.journey,
            celebrationMessage: result.celebrationMessage,
          },
        });
      }

      case 'calculate_wellness': {
        const score = await calculateWellnessScore(session.user.id);

        return NextResponse.json({
          success: true,
          data: { wellnessScore: score },
        });
      }

      case 'check_graduation': {
        const criteria = await checkGraduationCriteria(session.user.id);

        return NextResponse.json({
          success: true,
          data: { graduationCriteria: criteria },
        });
      }

      case 'graduate': {
        const journey = await getUserJourney(session.user.id);

        if (!journey.graduationEligible) {
          return NextResponse.json(
            { error: 'User is not eligible for graduation' },
            { status: 400 }
          );
        }

        const updatedJourney = await graduateUser(session.user.id, graduationNotes);

        return NextResponse.json({
          success: true,
          data: {
            journey: updatedJourney,
            message: 'Congratulations on completing your journey!',
          },
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Journey action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
