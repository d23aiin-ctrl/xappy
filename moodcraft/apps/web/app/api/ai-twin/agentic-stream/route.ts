import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/encryption';
import { nlpService } from '@/lib/nlp-service';

/**
 * Agentic AI Twin Streaming Chat API
 *
 * Uses the Python FastAPI backend with LangChain/LangGraph multi-agent system.
 * This provides:
 * - Multi-agent orchestration (Signal Gather → Triage → Therapist → Response)
 * - Vector store RAG for long-term memory
 * - Proper crisis detection and escalation
 * - Intervention tagging
 */
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

    const userId = session.user.id;

    // Get or create chat
    let chat;
    if (chatId) {
      chat = await prisma.aITwinChat.findFirst({
        where: { id: chatId, userId, isActive: true },
      });
    }
    if (!chat) {
      chat = await prisma.aITwinChat.create({
        data: { userId },
      });
    }

    // Get user profile for archetype
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { archetype: true, streakDays: true },
    });

    // Get recent mood for context
    const recentMood = await prisma.moodEntry.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { moodScore: true, phq9Score: true, gad7Score: true },
    });

    // Save user message
    await prisma.aITwinMessage.create({
      data: {
        chatId: chat.id,
        role: 'user',
        contentEnc: encrypt(message),
      },
    });

    // Stream from the Python NLP service (LangChain/LangGraph backend)
    const encoder = new TextEncoder();
    let fullResponse = '';
    let detectedIntervention: string | null = null;
    let riskLevel = 'low';
    let shouldEscalate = false;
    let crisisDetected = false;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial metadata
          const metaData = JSON.stringify({ chatId: chat!.id, riskFlagged: false });
          controller.enqueue(encoder.encode(`data: ${metaData}\n\n`));

          // Call the Python NLP service with LangGraph AI Twin
          for await (const chunk of nlpService.aiTwinStream({
            user_id: userId,
            chat_id: chat!.id,
            message,
            archetype: profile?.archetype || 'SEEKER',
            context: {
              streak_days: profile?.streakDays || 0,
              recent_mood: recentMood?.moodScore,
              phq9_score: recentMood?.phq9Score,
              gad7_score: recentMood?.gad7Score,
            },
          })) {
            // Handle different event types from the Python backend
            if (chunk.type === 'metadata') {
              // Update risk and escalation info
              const data = chunk.data as Record<string, unknown>;
              riskLevel = (data.risk_level as string) || 'low';
              shouldEscalate = (data.should_escalate as boolean) || false;
              crisisDetected = (data.crisis_detected as boolean) || false;
              detectedIntervention = (data.intervention as string) || null;

              if (crisisDetected) {
                // Create escalation if crisis detected
                await prisma.escalation.create({
                  data: {
                    userId,
                    trigger: 'KEYWORD_DETECTED',
                    triggerData: { source: 'ai_twin_agentic', risk_level: riskLevel },
                    riskScore: 85,
                    status: 'AI_TWIN_REVIEW',
                  },
                });
              }

              // Send metadata to client
              const metaChunk = JSON.stringify({
                riskLevel,
                shouldEscalate,
                crisisDetected,
                interventionType: detectedIntervention,
              });
              controller.enqueue(encoder.encode(`data: ${metaChunk}\n\n`));
            } else if (chunk.type === 'token') {
              // Stream response tokens
              const token = chunk.data as string;
              fullResponse += token;
              const data = JSON.stringify({ token });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            } else if (chunk.type === 'complete') {
              // Final response data
              const data = chunk.data as Record<string, unknown>;
              fullResponse = (data.response as string) || fullResponse;
              detectedIntervention = (data.intervention as string) || detectedIntervention;
            }
          }

          // Save the complete response
          const savedMessage = await prisma.aITwinMessage.create({
            data: {
              chatId: chat!.id,
              role: 'assistant',
              contentEnc: encrypt(fullResponse),
              interventionType: detectedIntervention,
              riskFlagged: riskLevel === 'high' || riskLevel === 'critical',
            },
          });

          // Update user message if risk was flagged
          if (crisisDetected || riskLevel === 'high' || riskLevel === 'critical') {
            await prisma.aITwinMessage.updateMany({
              where: { chatId: chat!.id, role: 'user' },
              data: { riskFlagged: true },
            });
          }

          // Index to long-term memory via NLP service (non-blocking)
          if (message.length > 50) {
            nlpService.addMemory({
              user_id: userId,
              content: message,
              memory_type: 'chat',
              source_id: `ai-twin-${Date.now()}`,
              metadata: { chatId: chat!.id, source: 'ai_twin' },
            }).catch(() => {});
          }

          // Index AI insights to memory
          if (detectedIntervention === 'REFRAME' || detectedIntervention === 'PSYCHOEDUCATION') {
            nlpService.addMemory({
              user_id: userId,
              content: fullResponse,
              memory_type: 'insight',
              source_id: savedMessage.id,
              metadata: {
                source: 'ai_twin',
                interventionType: detectedIntervention,
              },
            }).catch(() => {});
          }

          // Send final data
          const endData = JSON.stringify({
            interventionType: detectedIntervention,
            messageId: savedMessage.id,
            riskLevel,
          });
          controller.enqueue(encoder.encode(`data: ${endData}\n\n`));

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Agentic stream error:', error);

          // Fallback response
          const fallback =
            "I'm here with you. I'm experiencing a technical issue, but please know you're not alone. If you're in crisis, please reach out to a crisis helpline.";

          const data = JSON.stringify({ token: fallback });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));

          // Save fallback response
          await prisma.aITwinMessage.create({
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
  } catch (error) {
    console.error('Agentic AI Twin error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
