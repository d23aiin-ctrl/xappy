import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * Therapist Feedback API
 *
 * Allows therapists to provide feedback that improves AI Twin's approach
 * This is the key to "mixed reality" - human insight training AI behavior
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a therapist
    const therapist = await prisma.therapistProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!therapist) {
      return NextResponse.json(
        { error: 'Only therapists can submit feedback' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      escalationId,
      aiTwinHelpful,
      briefAccuracy,
      missedFactors,
      incorrectAssessments,
      recommendedFocus,
      contraindicated,
      therapeuticApproach,
      sessionNotes,
      progressMade,
      nextSteps,
    } = body;

    if (!escalationId) {
      return NextResponse.json(
        { error: 'Escalation ID required' },
        { status: 400 }
      );
    }

    // Verify therapist has access to this escalation
    const escalation = await prisma.escalation.findFirst({
      where: {
        id: escalationId,
        therapistId: therapist.id,
      },
    });

    if (!escalation) {
      return NextResponse.json(
        { error: 'Escalation not found or not assigned to you' },
        { status: 404 }
      );
    }

    // Create therapist feedback
    const feedback = await prisma.therapistFeedback.create({
      data: {
        escalationId,
        therapistId: therapist.id,
        userId: escalation.userId,
        aiTwinHelpful,
        briefAccuracy,
        missedFactors,
        incorrectAssessments,
        recommendedFocus,
        contraindicated,
        therapeuticApproach,
        sessionNotes,
        progressMade,
        nextSteps,
      },
    });

    // Update the user's AI Twin session context with therapist guidance
    if (recommendedFocus || contraindicated || therapeuticApproach) {
      await prisma.aITwinSessionContext.upsert({
        where: { userId: escalation.userId },
        create: {
          userId: escalation.userId,
          therapistNotes: sessionNotes,
          therapistGuidance: {
            recommendedFocus,
            contraindicated,
            therapeuticApproach,
            updatedAt: new Date().toISOString(),
            therapistId: therapist.id,
          },
        },
        update: {
          therapistNotes: sessionNotes,
          therapistGuidance: {
            recommendedFocus,
            contraindicated,
            therapeuticApproach,
            updatedAt: new Date().toISOString(),
            therapistId: therapist.id,
          },
        },
      });
    }

    // Log the feedback action
    await prisma.escalationLog.create({
      data: {
        escalationId,
        action: 'THERAPIST_FEEDBACK_SUBMITTED',
        details: {
          aiTwinHelpful,
          briefAccuracy,
          hasGuidance: !!(recommendedFocus || contraindicated || therapeuticApproach),
        },
        actorId: session.user.id,
      },
    });

    // If progress was made, potentially update escalation status
    if (progressMade) {
      await prisma.escalation.update({
        where: { id: escalationId },
        data: { status: 'IN_PROGRESS' },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted. AI Twin will incorporate your guidance.',
      feedbackId: feedback.id,
    });
  } catch (error) {
    console.error('Therapist feedback error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET - Get therapist's feedback history for an escalation
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const therapist = await prisma.therapistProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!therapist) {
      return NextResponse.json(
        { error: 'Only therapists can view feedback' },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const escalationId = url.searchParams.get('escalationId');

    if (escalationId) {
      // Get feedback for specific escalation
      const feedbacks = await prisma.therapistFeedback.findMany({
        where: { escalationId, therapistId: therapist.id },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ success: true, data: feedbacks });
    }

    // Get recent feedback from this therapist
    const feedbacks = await prisma.therapistFeedback.findMany({
      where: { therapistId: therapist.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        escalation: {
          select: {
            id: true,
            status: true,
            trigger: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: feedbacks });
  } catch (error) {
    console.error('Get therapist feedback error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
