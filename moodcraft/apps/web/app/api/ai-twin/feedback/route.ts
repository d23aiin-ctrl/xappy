import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * AI Twin Message Feedback API
 *
 * Allows users to rate whether AI Twin responses were helpful
 * This data feeds back into intervention effectiveness tracking
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messageId, rating } = await req.json();

    if (!messageId || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Valid messageId and rating (1-5) required' },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Verify message belongs to user's chat
    const message = await prisma.aITwinMessage.findFirst({
      where: {
        id: messageId,
        chat: { userId },
      },
      include: {
        chat: true,
      },
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Update message with rating
    await prisma.aITwinMessage.update({
      where: { id: messageId },
      data: { helpfulRating: rating },
    });

    // Update session context with intervention effectiveness
    if (message.interventionType) {
      await updateInterventionEffectiveness(userId, message.interventionType, rating);
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback recorded. This helps your AI Twin learn what works best for you.',
    });
  } catch (error) {
    console.error('AI Twin feedback error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Update the user's session context with intervention effectiveness data
 */
async function updateInterventionEffectiveness(
  userId: string,
  interventionType: string,
  rating: number
) {
  const existingContext = await prisma.aITwinSessionContext.findUnique({
    where: { userId },
  });

  const currentInterventions = (existingContext?.effectiveInterventions as any[]) || [];
  const isPositive = rating >= 4;

  // Find or create entry for this intervention type
  const existingIdx = currentInterventions.findIndex(
    (i) => i.type === interventionType
  );

  if (existingIdx >= 0) {
    // Update existing intervention stats
    const existing = currentInterventions[existingIdx];
    const totalRatings = (existing.totalRatings || 1) + 1;
    const positiveRatings = (existing.positiveRatings || (existing.successRate > 0.5 ? 1 : 0)) + (isPositive ? 1 : 0);
    const successRate = positiveRatings / totalRatings;

    currentInterventions[existingIdx] = {
      type: interventionType,
      successRate: Math.round(successRate * 100) / 100,
      totalRatings,
      positiveRatings,
      lastRating: rating,
    };
  } else {
    // Add new intervention type
    currentInterventions.push({
      type: interventionType,
      successRate: isPositive ? 1 : 0,
      totalRatings: 1,
      positiveRatings: isPositive ? 1 : 0,
      lastRating: rating,
    });
  }

  // Upsert session context
  await prisma.aITwinSessionContext.upsert({
    where: { userId },
    create: {
      userId,
      effectiveInterventions: currentInterventions,
    },
    update: {
      effectiveInterventions: currentInterventions,
    },
  });
}
