import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { generateCaseBrief } from '@/lib/ai/ai-twin';

/**
 * AI Twin Chat API
 *
 * GET - Get or create AI Twin chat for the current user
 * Returns chat with messages and generates a fresh brief if needed
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Check for existing active chat
    let chat = await prisma.aITwinChat.findFirst({
      where: { userId, isActive: true },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 50,
        },
      },
    });

    // If no active chat, create one with a fresh brief
    if (!chat) {
      // Generate case brief for context
      let briefSummary: string | null = null;
      try {
        const brief = await generateCaseBrief(userId, 'ai-twin-init');
        briefSummary = JSON.stringify(brief);
      } catch (err) {
        console.error('Failed to generate AI Twin brief:', err);
      }

      chat = await prisma.aITwinChat.create({
        data: {
          userId,
          briefSummary,
        },
        include: {
          messages: true,
        },
      });
    }

    // Decrypt messages for client
    const messages = chat.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: decrypt(m.contentEnc),
      interventionType: m.interventionType,
      riskFlagged: m.riskFlagged,
      createdAt: m.createdAt.toISOString(),
    }));

    // Get user profile for archetype
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { archetype: true, streakDays: true },
    });

    // Check if therapist is assigned (for escalation cases)
    const activeEscalation = await prisma.escalation.findFirst({
      where: {
        userId,
        status: { in: ['PENDING', 'AI_TWIN_REVIEW', 'THERAPIST_ASSIGNED', 'IN_PROGRESS'] },
      },
      select: { therapistId: true, status: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: chat.id,
        messages,
        archetype: profile?.archetype || 'DRIFTER',
        streakDays: profile?.streakDays || 0,
        handoffRequested: chat.handoffRequested,
        escalationActive: !!activeEscalation,
        therapistAssigned: !!activeEscalation?.therapistId,
      },
    });
  } catch (error) {
    console.error('AI Twin chat GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST - Start a new AI Twin chat session
 * Closes existing active chat and creates a new one with fresh brief
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Close any existing active chats
    await prisma.aITwinChat.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    // Generate fresh case brief
    let briefSummary: string | null = null;
    try {
      const brief = await generateCaseBrief(userId, 'ai-twin-new-session');
      briefSummary = JSON.stringify(brief);
    } catch (err) {
      console.error('Failed to generate AI Twin brief:', err);
    }

    // Create new chat
    const chat = await prisma.aITwinChat.create({
      data: {
        userId,
        briefSummary,
      },
    });

    // Get user profile
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { archetype: true, streakDays: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: chat.id,
        messages: [],
        archetype: profile?.archetype || 'DRIFTER',
        streakDays: profile?.streakDays || 0,
        handoffRequested: false,
      },
    });
  } catch (error) {
    console.error('AI Twin chat POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
