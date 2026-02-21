import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { SESSION_SUMMARY_PROMPT } from '@/lib/ai/ai-twin-prompts';
import { extractAndStoreInsights } from '@/lib/ai/memory-rag';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface SessionSummaryResult {
  sessionSummary: string;
  keyThemes: string[];
  newInsights: string[];
  effectiveInterventions: string[];
  ineffectiveInterventions: string[];
  moodTrajectory: 'improved' | 'declined' | 'stable';
  topicsToRevisit: string[];
  concernsToMonitor: string[];
}

/**
 * AI Twin Session Summary API
 *
 * Generates a summary of the current session for continuity
 * Called when user ends a chat session or navigates away
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatId } = await req.json();
    const userId = session.user.id;

    // Get the chat and its messages
    const chat = await prisma.aITwinChat.findFirst({
      where: { id: chatId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 30, // Last 30 messages for summary
        },
      },
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Decrypt messages for summary generation
    const conversation = chat.messages.map((m) => ({
      role: m.role,
      content: decrypt(m.contentEnc),
      interventionType: m.interventionType,
      helpfulRating: m.helpfulRating,
    }));

    // Format conversation for AI
    const conversationText = conversation
      .map((m) => {
        let line = `${m.role.toUpperCase()}: ${m.content}`;
        if (m.interventionType) line += ` [Intervention: ${m.interventionType}]`;
        if (m.helpfulRating) line += ` [User rated: ${m.helpfulRating}/5]`;
        return line;
      })
      .join('\n\n');

    // Generate summary using GPT-4o
    let summaryResult: SessionSummaryResult;
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SESSION_SUMMARY_PROMPT },
          { role: 'user', content: `Here is the conversation to summarize:\n\n${conversationText}` },
        ],
        max_tokens: 800,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      summaryResult = JSON.parse(completion.choices[0]?.message?.content || '{}');
    } catch (aiError) {
      console.error('AI summary generation failed:', aiError);
      // Fallback to basic summary
      summaryResult = {
        sessionSummary: `Session with ${conversation.length} exchanges.`,
        keyThemes: [],
        newInsights: [],
        effectiveInterventions: conversation
          .filter((m) => m.interventionType && m.helpfulRating && m.helpfulRating >= 4)
          .map((m) => m.interventionType as string),
        ineffectiveInterventions: conversation
          .filter((m) => m.interventionType && m.helpfulRating && m.helpfulRating <= 2)
          .map((m) => m.interventionType as string),
        moodTrajectory: 'stable',
        topicsToRevisit: [],
        concernsToMonitor: conversation
          .filter((m) => m.role === 'user' && m.content.toLowerCase().includes('anxious'))
          .length > 0
          ? ['anxiety']
          : [],
      };
    }

    // Get existing session context
    const existingContext = await prisma.aITwinSessionContext.findUnique({
      where: { userId },
    });

    // Merge themes (keep unique, max 10)
    const existingThemes = (existingContext?.keyThemes as string[]) || [];
    const newThemes = [...new Set([...summaryResult.keyThemes, ...existingThemes])].slice(0, 10);

    // Merge insights (keep recent, max 5)
    const existingInsights = (existingContext?.recentInsights as string[]) || [];
    const newInsights = [...summaryResult.newInsights, ...existingInsights].slice(0, 5);

    // Update session context
    await prisma.aITwinSessionContext.upsert({
      where: { userId },
      create: {
        userId,
        lastSessionSummary: summaryResult.sessionSummary,
        keyThemes: newThemes,
        recentInsights: newInsights,
      },
      update: {
        lastSessionSummary: summaryResult.sessionSummary,
        keyThemes: newThemes,
        recentInsights: newInsights,
      },
    });

    // Mark chat as inactive (session ended)
    await prisma.aITwinChat.update({
      where: { id: chatId },
      data: { isActive: false },
    });

    // Extract and store long-term insights (non-blocking)
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { archetype: true },
    });

    extractAndStoreInsights(
      userId,
      conversation.map((c) => ({ role: c.role, content: c.content })),
      profile?.archetype || 'SEEKER'
    ).catch((err) => console.error('Insight extraction failed:', err));

    return NextResponse.json({
      success: true,
      data: {
        summary: summaryResult.sessionSummary,
        topicsToRevisit: summaryResult.topicsToRevisit,
        concerns: summaryResult.concernsToMonitor,
      },
    });
  } catch (error) {
    console.error('Session summary error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET - Get current session context for user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const context = await prisma.aITwinSessionContext.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      success: true,
      data: context || { message: 'No session history yet' },
    });
  } catch (error) {
    console.error('Get session context error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
