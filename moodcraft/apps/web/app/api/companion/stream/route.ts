import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/encryption';
import { buildCompanionSystemPrompt, detectRiskKeywords, CRISIS_RESPONSE } from '@/lib/ai/companion-prompts';
import { getConversationContext, buildContextPrompt, indexUserContent } from '@/lib/ai/memory-rag';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { message, chatId } = await req.json();
    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: 'Message is required' }), { status: 400 });
    }

    // Get user profile and recent mood
    const [profile, recentMood] = await Promise.all([
      prisma.userProfile.findUnique({ where: { userId: session.user.id } }),
      prisma.moodEntry.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

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

    // Risk detection
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

    // If risk detected, return crisis response as stream
    if (riskFlagged) {
      await prisma.escalation.create({
        data: {
          userId: session.user.id,
          trigger: 'KEYWORD_DETECTED',
          triggerData: { keywords: riskKeywords, source: 'companion_chat' },
          riskScore: 80,
        },
      });

      await prisma.companionMessage.create({
        data: {
          chatId: chat.id,
          role: 'assistant',
          contentEnc: encrypt(CRISIS_RESPONSE),
        },
      });

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const data = JSON.stringify({ chatId: chat!.id, riskFlagged: true });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          // Send crisis response word by word
          const words = CRISIS_RESPONSE.split(' ');
          let i = 0;
          const interval = setInterval(() => {
            if (i < words.length) {
              const chunk = JSON.stringify({ token: words[i] + ' ' });
              controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
              i++;
            } else {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
              clearInterval(interval);
            }
          }, 30);
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    // Fetch RAG memory context for personalized responses
    const memoryContext = await getConversationContext(session.user.id, message);
    const ragContextPrompt = buildContextPrompt(memoryContext.relevantMemories, memoryContext.userSummary);

    // Build system prompt with user context and memory
    const baseSystemPrompt = buildCompanionSystemPrompt({
      archetype: profile?.archetype || 'DRIFTER',
      currentMood: recentMood?.moodScore,
      streakDays: profile?.streakDays,
      userName: session.user.name?.split(' ')[0],
    });

    // Combine base prompt with RAG context
    const systemPrompt = baseSystemPrompt + ragContextPrompt;

    // Get conversation history
    const recentMessages = await prisma.companionMessage.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const conversationHistory = recentMessages.reverse().map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: decrypt(m.contentEnc),
    }));

    // Stream from OpenAI
    const encoder = new TextEncoder();
    let fullResponse = '';
    const userMessage = message; // Store for indexing later

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: message },
        ],
        max_tokens: 400,
        temperature: 0.7,
        stream: true,
      });

      const stream = new ReadableStream({
        async start(controller) {
          // Send chat ID first
          const metaData = JSON.stringify({ chatId: chat!.id, riskFlagged: false });
          controller.enqueue(encoder.encode(`data: ${metaData}\n\n`));

          try {
            for await (const chunk of completion) {
              const token = chunk.choices[0]?.delta?.content;
              if (token) {
                fullResponse += token;
                const data = JSON.stringify({ token });
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              }
            }

            // Save complete response
            const savedMessage = await prisma.companionMessage.create({
              data: {
                chatId: chat!.id,
                role: 'assistant',
                contentEnc: encrypt(fullResponse),
              },
            });

            // Index chat for future RAG retrieval (fire and forget)
            indexUserContent(session.user.id, 'chat', savedMessage.id, `User: ${userMessage}\nAssistant: ${fullResponse}`, {
              chatId: chat!.id,
              archetype: profile?.archetype,
            }).catch(err => console.error('Failed to index chat:', err));

            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (streamError) {
            // If streaming fails, send fallback
            const fallback = "I hear you. Thank you for sharing that with me. What else would you like to explore?";
            const data = JSON.stringify({ token: fallback });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));

            await prisma.companionMessage.create({
              data: {
                chatId: chat!.id,
                role: 'assistant',
                contentEnc: encrypt(fallback),
              },
            });

            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    } catch (aiError) {
      // Fallback non-streaming response
      const fallback = "I'm here with you. Thank you for sharing that. What else is on your mind?";

      await prisma.companionMessage.create({
        data: {
          chatId: chat.id,
          role: 'assistant',
          contentEnc: encrypt(fallback),
        },
      });

      const stream = new ReadableStream({
        start(controller) {
          const metaData = JSON.stringify({ chatId: chat!.id, riskFlagged: false });
          controller.enqueue(encoder.encode(`data: ${metaData}\n\n`));
          const data = JSON.stringify({ token: fallback });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }
  } catch (error) {
    console.error('Stream error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
