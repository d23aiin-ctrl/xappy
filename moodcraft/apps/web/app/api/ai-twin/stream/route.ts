import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/encryption';
import {
  buildAITwinSystemPrompt,
  detectCrisisKeywords,
  CRISIS_RESPONSE_TEMPLATE,
  GROUNDING_EXERCISES,
} from '@/lib/ai/ai-twin-prompts';
import type { CaseBrief } from '@/lib/ai/ai-twin';
import {
  getConversationContext,
  buildContextPrompt,
  indexUserContent,
  getUserPatternSummary,
} from '@/lib/ai/memory-rag';
import { createTracer, logAIInteraction } from '@/lib/ai/traceability';
import { evaluateEscalationTriggers, getInterventionProtocol } from '@/lib/ai/policy-store';
import { getContextualGuidelines } from '@/lib/ai/therapy-guidelines';
import { buildGoalContext } from '@/lib/ai/session-goals';
import { processContent as extractEntities, buildEntityContext } from '@/lib/ai/entity-extraction';
import { buildJourneyContext, calculateWellnessScore } from '@/lib/ai/user-journey';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * AI Twin Streaming Chat API
 *
 * Handles real-time streaming conversation with the AI Twin
 * Includes crisis detection, intervention tagging, and mixed reality support
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

    // Get or verify chat
    let chat;
    if (chatId) {
      chat = await prisma.aITwinChat.findFirst({
        where: { id: chatId, userId, isActive: true },
      });
    }
    if (!chat) {
      // Create new chat if none exists
      chat = await prisma.aITwinChat.create({
        data: { userId },
      });
    }

    // Get user context including session continuity and therapist guidance
    const [profile, recentMood, activeEscalation, sessionContext, therapistFeedback] = await Promise.all([
      prisma.userProfile.findUnique({
        where: { userId },
        select: { archetype: true, streakDays: true },
      }),
      prisma.moodEntry.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { moodScore: true, sentimentLabel: true },
      }),
      prisma.escalation.findFirst({
        where: {
          userId,
          status: { in: ['PENDING', 'AI_TWIN_REVIEW', 'THERAPIST_ASSIGNED', 'IN_PROGRESS'] },
        },
        select: { id: true, therapistId: true, status: true },
      }),
      // NEW: Get session continuity context
      prisma.aITwinSessionContext.findUnique({
        where: { userId },
      }),
      // NEW: Get latest therapist feedback for guidance
      prisma.therapistFeedback.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          recommendedFocus: true,
          contraindicated: true,
          therapeuticApproach: true,
          sessionNotes: true,
        },
      }),
    ]);

    // Crisis detection
    const crisisKeywords = detectCrisisKeywords(message);
    const isCrisis = crisisKeywords.length > 0;

    // Save user message
    await prisma.aITwinMessage.create({
      data: {
        chatId: chat.id,
        role: 'user',
        contentEnc: encrypt(message),
        riskFlagged: isCrisis,
        riskKeywords: crisisKeywords.length > 0 ? crisisKeywords : undefined,
      },
    });

    // If crisis detected, create escalation and return crisis response
    if (isCrisis) {
      // Create or update escalation
      if (!activeEscalation) {
        await prisma.escalation.create({
          data: {
            userId,
            trigger: 'KEYWORD_DETECTED',
            triggerData: { keywords: crisisKeywords, source: 'ai_twin_chat' },
            riskScore: 85,
            status: 'AI_TWIN_REVIEW',
          },
        });
      }

      // Save crisis response
      await prisma.aITwinMessage.create({
        data: {
          chatId: chat.id,
          role: 'assistant',
          contentEnc: encrypt(CRISIS_RESPONSE_TEMPLATE),
          interventionType: 'CRISIS_SUPPORT',
        },
      });

      // Stream crisis response
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const data = JSON.stringify({
            chatId: chat!.id,
            riskFlagged: true,
            interventionType: 'CRISIS_SUPPORT',
          });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));

          // Stream the crisis response word by word
          const words = CRISIS_RESPONSE_TEMPLATE.split(' ');
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
          }, 25);
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

    // Parse brief if available
    let caseBrief: Partial<CaseBrief> | undefined;
    if (chat.briefSummary) {
      try {
        caseBrief = JSON.parse(chat.briefSummary);
      } catch {}
    }

    // ─── LONG-TERM MEMORY: Retrieve relevant memories ───────────────
    let memoryContext = '';
    let patternSummary = '';
    let goalContext = '';
    let entityContext = '';
    let journeyContext = '';
    let guidelineContext = '';
    let interventionProtocol: any = null;

    try {
      const [contextResult, patterns, goals, entities, journey] = await Promise.all([
        getConversationContext(
          userId,
          message,
          [] // Could pass recent messages here for better context
        ),
        getUserPatternSummary(userId),
        buildGoalContext(userId),
        buildEntityContext(userId),
        buildJourneyContext(userId),
      ]);

      memoryContext = buildContextPrompt(contextResult.relevantMemories, contextResult.userSummary);
      patternSummary = patterns;
      goalContext = goals;
      entityContext = entities;
      journeyContext = journey;

      // Get relevant therapy guidelines for the message context
      if (recentMood?.moodScore && recentMood.moodScore <= 4) {
        const guidelines = await getContextualGuidelines({
          presentingIssue: message,
          archetype: profile?.archetype || undefined,
          moodScore: recentMood.moodScore,
          riskLevel: activeEscalation ? 'high' : 'low',
        });
        if (guidelines.synthesizedGuidance) {
          guidelineContext = guidelines.synthesizedGuidance;
        }
      }

      // Check if there's a recommended intervention protocol
      interventionProtocol = await getInterventionProtocol({
        moodScore: recentMood?.moodScore,
        sentimentScore: recentMood?.sentimentLabel === 'negative' ? -0.5 : 0.3,
        archetype: profile?.archetype || undefined,
      });
    } catch (memError) {
      console.error('Memory retrieval error:', memError);
      // Continue without memory context
    }

    // ─── POLICY-BASED ESCALATION CHECK ────────────────────────────
    try {
      const escalationResult = await evaluateEscalationTriggers({
        userId,
        archetype: profile?.archetype || undefined,
        moodScore: recentMood?.moodScore,
        sentimentScore: recentMood?.sentimentLabel === 'negative' ? -0.5 : 0.3,
        messageText: message,
      });

      if (escalationResult.triggered && !activeEscalation) {
        // Log the policy-triggered escalation
        console.log('Policy-triggered escalation:', escalationResult.matchedRules);
      }
    } catch (policyError) {
      console.error('Policy evaluation error:', policyError);
    }

    // Build session continuity data
    const sessionContinuity = sessionContext
      ? {
          keyThemes: sessionContext.keyThemes as string[] | undefined,
          effectiveInterventions: sessionContext.effectiveInterventions as { type: string; successRate: number }[] | undefined,
          avoidTopics: sessionContext.avoidTopics as string[] | undefined,
          preferredStyle: sessionContext.preferredStyle || undefined,
          lastSessionSummary: sessionContext.lastSessionSummary || undefined,
          recentInsights: sessionContext.recentInsights as string[] | undefined,
        }
      : undefined;

    // Build therapist guidance data (mixed reality)
    const therapistGuidance = therapistFeedback
      ? {
          recommendedFocus: therapistFeedback.recommendedFocus as string[] | undefined,
          contraindicated: therapistFeedback.contraindicated as string[] | undefined,
          therapeuticApproach: therapistFeedback.therapeuticApproach || undefined,
          notes: sessionContext?.therapistNotes || undefined,
        }
      : undefined;

    // Build system prompt with full context including continuity and guidance
    const baseSystemPrompt = buildAITwinSystemPrompt({
      archetype: profile?.archetype || 'DRIFTER',
      userName: session.user.name?.split(' ')[0],
      caseBrief,
      currentMood: recentMood?.moodScore,
      streakDays: profile?.streakDays,
      escalationActive: !!activeEscalation,
      therapistAssigned: !!activeEscalation?.therapistId,
      sessionContinuity,
      therapistGuidance,
    });

    // ─── COMBINE BASE PROMPT + ALL CONTEXT LAYERS ───────────────────
    let systemPrompt = baseSystemPrompt;

    // Add pattern summary (long-term patterns)
    if (patternSummary) {
      systemPrompt += `\n${patternSummary}`;
    }

    // Add memory context (relevant past experiences)
    if (memoryContext) {
      systemPrompt += `\n${memoryContext}`;
    }

    // Add active goals context
    if (goalContext) {
      systemPrompt += `\n${goalContext}`;
    }

    // Add entity map (key people, triggers, beliefs)
    if (entityContext) {
      systemPrompt += `\n${entityContext}`;
    }

    // Add journey context (stage, wellness score)
    if (journeyContext) {
      systemPrompt += `\n${journeyContext}`;
    }

    // Add therapy guidelines when mood is low
    if (guidelineContext) {
      systemPrompt += `\n${guidelineContext}`;
    }

    // Add intervention protocol if available
    if (interventionProtocol) {
      systemPrompt += `\n\n## Recommended Intervention Protocol\n`;
      systemPrompt += `Based on current context, consider using: ${interventionProtocol.protocol.name}\n`;
      if (interventionProtocol.archetypeModifier) {
        systemPrompt += `Archetype adaptation: ${interventionProtocol.archetypeModifier}\n`;
      }
    }

    // Get conversation history
    const recentMessages = await prisma.aITwinMessage.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const conversationHistory = recentMessages.reverse().map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: decrypt(m.contentEnc),
    }));

    // Stream from OpenAI with traceability
    const encoder = new TextEncoder();
    let fullResponse = '';
    let detectedIntervention: string | null = null;

    // Create tracer for AI interaction logging
    const tracer = createTracer({
      userId,
      sessionId: chat.id,
      feature: 'ai_twin',
      modelId: 'gpt-4o',
      systemPrompt,
      userInput: message,
      temperature: 0.7,
      maxTokens: 600,
    });

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: message },
        ],
        max_tokens: 600,
        temperature: 0.7,
        stream: true,
      });

      const stream = new ReadableStream({
        async start(controller) {
          // Send metadata first
          const metaData = JSON.stringify({ chatId: chat!.id, riskFlagged: false });
          controller.enqueue(encoder.encode(`data: ${metaData}\n\n`));

          try {
            for await (const chunk of completion) {
              const token = chunk.choices[0]?.delta?.content;
              if (token) {
                fullResponse += token;

                // Detect intervention type from response
                if (fullResponse.includes('[GROUNDING]')) detectedIntervention = 'GROUNDING';
                else if (fullResponse.includes('[REFRAME]')) detectedIntervention = 'REFRAME';
                else if (fullResponse.includes('[VALIDATION]')) detectedIntervention = 'VALIDATION';
                else if (fullResponse.includes('[CRISIS_SUPPORT]')) detectedIntervention = 'CRISIS_SUPPORT';
                else if (fullResponse.includes('[PSYCHOEDUCATION]')) detectedIntervention = 'PSYCHOEDUCATION';
                else if (fullResponse.includes('[COPING_SKILL]')) detectedIntervention = 'COPING_SKILL';

                // Clean intervention tags from displayed text
                const cleanToken = token
                  .replace(/\[(GROUNDING|REFRAME|VALIDATION|CRISIS_SUPPORT|PSYCHOEDUCATION|COPING_SKILL)\]/g, '');

                if (cleanToken) {
                  const data = JSON.stringify({ token: cleanToken });
                  controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                }
              }
            }

            // Clean full response for storage
            const cleanResponse = fullResponse
              .replace(/\[(GROUNDING|REFRAME|VALIDATION|CRISIS_SUPPORT|PSYCHOEDUCATION|COPING_SKILL)\]/g, '')
              .trim();

            // Save complete response
            const savedMessage = await prisma.aITwinMessage.create({
              data: {
                chatId: chat!.id,
                role: 'assistant',
                contentEnc: encrypt(cleanResponse),
                interventionType: detectedIntervention,
              },
            });

            // ─── INDEX TO LONG-TERM MEMORY ──────────────────────────────
            // Index significant user messages (longer than 50 chars)
            if (message.length > 50) {
              indexUserContent(userId, 'chat', `ai-twin-${Date.now()}`, message, {
                source: 'ai_twin',
                chatId: chat!.id,
              }).catch(() => {}); // Non-blocking

              // Extract entities from user message (non-blocking)
              extractEntities(userId, 'chat', savedMessage.id, message).catch(() => {});
            }

            // Index AI insights (reframes and psychoeducation are especially valuable)
            if (detectedIntervention === 'REFRAME' || detectedIntervention === 'PSYCHOEDUCATION') {
              indexUserContent(userId, 'insight', savedMessage.id, cleanResponse, {
                source: 'ai_twin',
                interventionType: detectedIntervention,
              }).catch(() => {}); // Non-blocking
            }

            // ─── LOG AI INTERACTION FOR TRACEABILITY ────────────────────
            tracer.success({
              interventionType: detectedIntervention || undefined,
              riskFlagged: false,
            }).catch(() => {}); // Non-blocking

            // ─── UPDATE WELLNESS SCORE (periodic) ───────────────────────
            // Update wellness score every 5 messages
            const messageCount = await prisma.aITwinMessage.count({
              where: { chatId: chat!.id },
            });
            if (messageCount % 5 === 0) {
              calculateWellnessScore(userId).catch(() => {}); // Non-blocking
            }

            // Send intervention type and message ID at the end (for feedback tracking)
            const endData = JSON.stringify({
              interventionType: detectedIntervention,
              messageId: savedMessage.id,
            });
            controller.enqueue(encoder.encode(`data: ${endData}\n\n`));

            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (streamError) {
            console.error('Stream error:', streamError);
            const fallback = "I'm here with you. Let me take a moment to understand what you're going through.";
            const data = JSON.stringify({ token: fallback });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));

            await prisma.aITwinMessage.create({
              data: {
                chatId: chat!.id,
                role: 'assistant',
                contentEnc: encrypt(fallback),
              },
            });

            // Log error to traceability
            tracer.error('STREAM_ERROR', String(streamError)).catch(() => {});

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
      console.error('OpenAI error:', aiError);

      // Log error to traceability
      tracer.error('OPENAI_ERROR', String(aiError)).catch(() => {});

      const fallback = "I'm listening. Thank you for sharing that with me. What would help you most right now?";

      await prisma.aITwinMessage.create({
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
    console.error('AI Twin stream error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
