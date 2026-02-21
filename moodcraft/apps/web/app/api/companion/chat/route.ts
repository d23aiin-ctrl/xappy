import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/encryption';
import { buildCompanionSystemPrompt, detectRiskKeywords, CRISIS_RESPONSE } from '@/lib/ai/companion-prompts';
import { getConversationContext, buildContextPrompt, indexUserContent } from '@/lib/ai/memory-rag';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create active chat
    let chat = await prisma.companionChat.findFirst({
      where: { userId: session.user.id, isActive: true },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 50,
        },
      },
    });

    if (!chat) {
      chat = await prisma.companionChat.create({
        data: { userId: session.user.id },
        include: { messages: true },
      });
    }

    // Decrypt messages for client
    const messages = chat.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.contentEnc ? decrypt(m.contentEnc) : '',
      createdAt: m.createdAt.toISOString(),
      riskFlagged: m.riskFlagged,
    }));

    return NextResponse.json({ success: true, data: { id: chat.id, messages } });
  } catch (error) {
    console.error('Chat fetch error:', error);
    const errorMessage = process.env.NODE_ENV === 'development'
      ? `Chat fetch error: ${error instanceof Error ? error.message : 'Unknown error'}`
      : 'Internal server error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { message, chatId } = await req.json();
    if (!message?.trim()) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
    }

    // Get user profile for context
    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    // Get recent mood for context
    const recentMood = await prisma.moodEntry.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    // Get or create chat
    let chat;
    if (chatId) {
      chat = await prisma.companionChat.findFirst({
        where: { id: chatId, userId: session.user.id },
      });
    }
    if (!chat) {
      chat = await prisma.companionChat.create({
        data: { userId: session.user.id },
      });
    }

    // Check for risk keywords
    const riskKeywords = detectRiskKeywords(message);
    const riskFlagged = riskKeywords.length > 0;

    // Save user message
    await prisma.companionMessage.create({
      data: {
        chatId: chat.id,
        role: 'user',
        contentEnc: encrypt(message),
        riskFlagged,
        riskKeywords: riskKeywords.length > 0 ? riskKeywords : undefined,
      },
    });

    // If risk detected, create escalation and return crisis response
    if (riskFlagged) {
      await prisma.escalation.create({
        data: {
          userId: session.user.id,
          trigger: 'KEYWORD_DETECTED',
          triggerData: { keywords: riskKeywords, source: 'companion_chat' },
          riskScore: 80,
        },
      });

      // Save crisis response
      await prisma.companionMessage.create({
        data: {
          chatId: chat.id,
          role: 'assistant',
          contentEnc: encrypt(CRISIS_RESPONSE),
        },
      });

      return NextResponse.json({
        success: true,
        data: { chatId: chat.id, response: CRISIS_RESPONSE, riskFlagged: true },
      });
    }

    // Build base system prompt
    const baseSystemPrompt = buildCompanionSystemPrompt({
      archetype: profile?.archetype || 'DRIFTER',
      currentMood: recentMood?.moodScore,
      streakDays: profile?.streakDays,
      userName: session.user.name?.split(' ')[0],
    });

    // Try to fetch RAG memory context (non-blocking)
    let ragContextPrompt = '';
    try {
      const memoryContext = await getConversationContext(session.user.id, message);
      ragContextPrompt = buildContextPrompt(memoryContext.relevantMemories, memoryContext.userSummary);
    } catch (ragError) {
      console.error('RAG context fetch failed (continuing without):', ragError);
    }

    // Combine base prompt with RAG context
    const systemPrompt = baseSystemPrompt + ragContextPrompt;

    // Get recent messages for context
    const recentMessages = await prisma.companionMessage.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const conversationHistory = recentMessages.reverse().map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: decrypt(m.contentEnc),
    }));

    let responseText: string;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: message },
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      responseText = completion.choices[0]?.message?.content || 'I\'m here with you. Tell me more about what\'s on your mind.';
    } catch (aiError) {
      // Fallback response if OpenAI fails
      responseText = 'I hear you. Thank you for sharing that with me. What else would you like to explore?';
    }

    // Save assistant response
    const savedMessage = await prisma.companionMessage.create({
      data: {
        chatId: chat.id,
        role: 'assistant',
        contentEnc: encrypt(responseText),
      },
    });

    // Index chat messages for future RAG retrieval (fire and forget)
    indexUserContent(session.user.id, 'chat', savedMessage.id, `User: ${message}\nAssistant: ${responseText}`, {
      chatId: chat.id,
      archetype: profile?.archetype,
    }).catch(err => console.error('Failed to index chat:', err));

    return NextResponse.json({
      success: true,
      data: { chatId: chat.id, response: responseText, riskFlagged: false },
    });
  } catch (error) {
    console.error('Chat error:', error);
    const errorMessage = process.env.NODE_ENV === 'development'
      ? `Chat error: ${error instanceof Error ? error.message : 'Unknown error'}`
      : 'Internal server error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
