import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/encryption';
import { generateCaseBrief } from '@/lib/ai/ai-twin';
import { HANDOFF_DOCUMENT_PROMPT } from '@/lib/ai/ai-twin-prompts';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * AI Twin Handoff API
 *
 * Handles the transition from AI Twin to human therapist
 * Part of the "mixed reality" care model
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatId, reason } = await req.json();
    const userId = session.user.id;

    // Get the AI Twin chat
    const chat = await prisma.aITwinChat.findFirst({
      where: { id: chatId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Mark chat as handoff requested
    await prisma.aITwinChat.update({
      where: { id: chatId },
      data: { handoffRequested: true },
    });

    // Generate fresh case brief for therapist
    let caseBrief;
    try {
      caseBrief = await generateCaseBrief(userId, chatId);
    } catch (err) {
      console.error('Failed to generate handoff brief:', err);
    }

    // Create summary of AI Twin conversation for therapist
    const conversationSummary = chat.messages.reverse().map((m) => ({
      role: m.role,
      content: decrypt(m.contentEnc),
      interventionType: m.interventionType,
      timestamp: m.createdAt.toISOString(),
    }));

    // Check for existing escalation or create new one
    let escalation = await prisma.escalation.findFirst({
      where: {
        userId,
        status: { in: ['PENDING', 'AI_TWIN_REVIEW', 'THERAPIST_ASSIGNED', 'IN_PROGRESS'] },
      },
    });

    if (!escalation) {
      // Create new escalation for therapist assignment
      escalation = await prisma.escalation.create({
        data: {
          userId,
          trigger: 'AI_COMPANION_FLAG',
          status: 'AI_TWIN_REVIEW',
          triggerData: {
            source: 'ai_twin_handoff',
            reason: reason || 'User requested human therapist',
            aiTwinChatId: chatId,
          },
          riskScore: 50, // Moderate risk for voluntary handoff
          aiTwinBriefEnc: caseBrief ? encrypt(JSON.stringify(caseBrief)) : null,
        },
      });

      // Log the escalation
      await prisma.escalationLog.create({
        data: {
          escalationId: escalation.id,
          action: 'AI_TWIN_HANDOFF_REQUESTED',
          details: {
            chatId,
            reason: reason || 'User requested human therapist',
            messageCount: chat.messages.length,
          },
          actorId: userId,
        },
      });
    } else {
      // Update existing escalation
      await prisma.escalation.update({
        where: { id: escalation.id },
        data: {
          status: 'AI_TWIN_REVIEW',
          aiTwinBriefEnc: caseBrief ? encrypt(JSON.stringify(caseBrief)) : escalation.aiTwinBriefEnc,
          triggerData: {
            ...(escalation.triggerData as object || {}),
            aiTwinHandoff: true,
            handoffChatId: chatId,
            handoffReason: reason,
          },
        },
      });

      await prisma.escalationLog.create({
        data: {
          escalationId: escalation.id,
          action: 'AI_TWIN_HANDOFF_REQUESTED',
          details: {
            chatId,
            reason: reason || 'User requested human therapist',
          },
          actorId: userId,
        },
      });
    }

    // Generate comprehensive handoff document for therapist
    await generateHandoffDocument(escalation.id, userId, conversationSummary, reason);

    // Find available therapist (simple matching - can be enhanced)
    const availableTherapist = await prisma.therapistProfile.findFirst({
      where: {
        isVerified: true,
        isAvailable: true,
        currentCaseload: { lt: prisma.therapistProfile.fields.maxCaseload },
      },
      orderBy: { currentCaseload: 'asc' },
      include: {
        user: {
          select: { name: true, image: true },
        },
      },
    });

    // Create handoff confirmation message in AI Twin chat
    const handoffMessage = availableTherapist
      ? `I've connected you with ${availableTherapist.user.name}, a licensed therapist who specializes in ${(availableTherapist.specializations as string[])?.slice(0, 2).join(' and ') || 'mental wellness'}. They'll be reviewing our conversation and reaching out to you soon. In the meantime, I'm still here if you need me.`
      : "I've submitted a request to connect you with a human therapist. Someone from our care team will reach out to you shortly. In the meantime, I'm still here if you need support.";

    await prisma.aITwinMessage.create({
      data: {
        chatId,
        role: 'assistant',
        contentEnc: encrypt(handoffMessage),
        interventionType: 'VALIDATION',
      },
    });

    // If therapist found, assign them
    if (availableTherapist) {
      await prisma.escalation.update({
        where: { id: escalation.id },
        data: {
          therapistId: availableTherapist.id,
          status: 'THERAPIST_ASSIGNED',
        },
      });

      await prisma.therapistProfile.update({
        where: { id: availableTherapist.id },
        data: { currentCaseload: { increment: 1 } },
      });

      await prisma.escalationLog.create({
        data: {
          escalationId: escalation.id,
          action: 'THERAPIST_ASSIGNED',
          details: {
            therapistId: availableTherapist.id,
            therapistName: availableTherapist.user.name,
          },
        },
      });

      // Create notification for therapist
      await prisma.notification.create({
        data: {
          userId: availableTherapist.userId,
          type: 'ESCALATION_UPDATE',
          title: 'New Case Assignment',
          body: 'An AI Twin handoff case has been assigned to you. Please review the case brief.',
          data: {
            escalationId: escalation.id,
            type: 'ai_twin_handoff',
          },
        },
      });
    }

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId,
        type: 'ESCALATION_UPDATE',
        title: 'Therapist Connection Requested',
        body: availableTherapist
          ? `You've been connected with ${availableTherapist.user.name}. They'll review your case and reach out soon.`
          : 'Your request for a human therapist has been submitted. Our care team will reach out shortly.',
        data: {
          escalationId: escalation.id,
          type: 'handoff_confirmation',
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        escalationId: escalation.id,
        therapistAssigned: !!availableTherapist,
        therapist: availableTherapist
          ? {
              name: availableTherapist.user.name,
              specializations: availableTherapist.specializations,
              avatar: availableTherapist.avatarUrl || availableTherapist.user.image,
            }
          : null,
        message: handoffMessage,
      },
    });
  } catch (error) {
    console.error('AI Twin handoff error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET - Check handoff status
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get active escalation
    const escalation = await prisma.escalation.findFirst({
      where: {
        userId,
        status: { in: ['AI_TWIN_REVIEW', 'THERAPIST_ASSIGNED', 'IN_PROGRESS'] },
      },
      include: {
        therapist: {
          include: {
            user: { select: { name: true, image: true } },
          },
        },
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!escalation) {
      return NextResponse.json({
        success: true,
        data: { hasActiveHandoff: false },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        hasActiveHandoff: true,
        escalationId: escalation.id,
        status: escalation.status,
        therapist: escalation.therapist
          ? {
              name: escalation.therapist.user.name,
              avatar: escalation.therapist.avatarUrl || escalation.therapist.user.image,
              specializations: escalation.therapist.specializations,
            }
          : null,
        recentUpdates: escalation.logs.map((log) => ({
          action: log.action,
          timestamp: log.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error('AI Twin handoff status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Generate a comprehensive handoff document for the therapist
 * This gives the therapist complete context about the AI Twin conversation
 */
async function generateHandoffDocument(
  escalationId: string,
  userId: string,
  conversationSummary: { role: string; content: string; interventionType: string | null; timestamp: string }[],
  handoffReason: string
) {
  try {
    // Get user's session context and profile
    const [sessionContext, profile, previousTherapistFeedback] = await Promise.all([
      prisma.aITwinSessionContext.findUnique({ where: { userId } }),
      prisma.userProfile.findUnique({
        where: { userId },
        select: { archetype: true, streakDays: true },
      }),
      prisma.therapistFeedback.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { sessionNotes: true, progressMade: true },
      }),
    ]);

    // Format conversation for AI analysis
    const conversationText = conversationSummary
      .map((m) => `${m.role.toUpperCase()} [${m.timestamp}]: ${m.content}${m.interventionType ? ` [${m.interventionType}]` : ''}`)
      .join('\n\n');

    // Generate handoff document using GPT-4o
    let handoffData;
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: HANDOFF_DOCUMENT_PROMPT },
          {
            role: 'user',
            content: `Generate a handoff document for this conversation:

USER CONTEXT:
- Archetype: ${profile?.archetype || 'Unknown'}
- Wellness streak: ${profile?.streakDays || 0} days
- Previous session summary: ${sessionContext?.lastSessionSummary || 'First session'}
- Known themes: ${(sessionContext?.keyThemes as string[])?.join(', ') || 'None identified'}

HANDOFF REASON: ${handoffReason || 'User requested human therapist'}

CONVERSATION:
${conversationText}`,
          },
        ],
        max_tokens: 1000,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      handoffData = JSON.parse(completion.choices[0]?.message?.content || '{}');
    } catch (aiError) {
      console.error('AI handoff document generation failed:', aiError);
      // Fallback handoff document
      handoffData = {
        executiveSummary: `User requested therapist handoff after ${conversationSummary.length} exchanges with AI Twin.`,
        presentingConcern: handoffReason || 'User requested human therapist connection',
        conversationHighlights: conversationSummary.slice(-5).map((m) => ({
          userStatement: m.role === 'user' ? m.content.substring(0, 200) : null,
          significance: m.interventionType || 'general exchange',
        })),
        interventionsAttempted: [...new Set(conversationSummary.filter((m) => m.interventionType).map((m) => m.interventionType))],
        emotionalState: {
          current: 'Requires assessment',
          trajectory: 'unknown',
          riskLevel: 'moderate',
        },
        userPreferences: {},
        recommendedApproach: 'Standard therapeutic assessment recommended',
        urgentConsiderations: [],
        questionsForUser: [],
      };
    }

    // Create handoff document
    await prisma.handoffDocument.create({
      data: {
        escalationId,
        userId,
        conversationSummary: handoffData.executiveSummary,
        keyExchanges: handoffData.conversationHighlights,
        interventionsUsed: handoffData.interventionsAttempted,
        currentEmotionalState: handoffData.emotionalState?.current,
        immediateRisks: handoffData.urgentConsiderations,
        userPreferences: handoffData.userPreferences,
        previousTherapistNotes: previousTherapistFeedback?.sessionNotes,
        priorTreatmentHistory: previousTherapistFeedback?.progressMade
          ? { lastProgress: previousTherapistFeedback.progressMade }
          : undefined,
        handoffReason: handoffReason || 'User requested human therapist',
        urgencyLevel: handoffData.emotionalState?.riskLevel === 'critical'
          ? 'critical'
          : handoffData.emotionalState?.riskLevel === 'high'
          ? 'urgent'
          : 'normal',
      },
    });

    return handoffData;
  } catch (error) {
    console.error('Handoff document generation error:', error);
    // Non-blocking - don't fail the handoff if document generation fails
    return null;
  }
}
