import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Streaming endpoint for real-time journal insights
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { content, insightType = 'reflection' } = await req.json();

    if (!content?.trim() || content.length < 50) {
      return new Response(JSON.stringify({ error: 'Content too short for insights' }), { status: 400 });
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

    const archetype = profile?.archetype || 'SEEKER';

    // Build insight prompt based on type
    const systemPrompts: Record<string, string> = {
      reflection: `You are an empathetic journaling companion helping users gain self-awareness. Analyze the journal entry and provide:
1. Key themes or emotions detected
2. Patterns or insights worth exploring
3. A gentle, thoughtful reflection question

Keep your response warm, concise (under 150 words), and personalized. User archetype: ${archetype}.`,

      emotions: `You are an emotional intelligence guide. Analyze the journal entry and identify:
1. Primary emotions expressed (with confidence level)
2. Secondary or underlying emotions
3. Emotional trajectory throughout the writing

Format as a brief, supportive analysis. Keep it under 100 words.`,

      growth: `You are a growth-focused journaling coach. Based on this entry, identify:
1. Any cognitive patterns (growth vs fixed mindset)
2. Opportunities for reframing
3. One actionable insight for personal growth

Be encouraging but not preachy. Keep it under 100 words.`,

      creative: `You are a creative writing companion. Based on this entry, offer:
1. A metaphor that captures the essence of their experience
2. A creative prompt to explore further
3. An unexpected connection or perspective

Be poetic but accessible. Keep it under 100 words.`,
    };

    const systemPrompt = systemPrompts[insightType] || systemPrompts.reflection;

    // Add mood context if available
    let userContext = '';
    if (recentMood) {
      userContext = `\n\nUser's recent mood: ${recentMood.emoji} (score: ${recentMood.moodScore}/10)`;
    }

    const encoder = new TextEncoder();

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt + userContext },
          { role: 'user', content: `Analyze this journal entry:\n\n"${content}"` },
        ],
        max_tokens: 250,
        temperature: 0.7,
        stream: true,
      });

      const stream = new ReadableStream({
        async start(controller) {
          // Send metadata
          const meta = JSON.stringify({ type: insightType, archetype });
          controller.enqueue(encoder.encode(`data: ${meta}\n\n`));

          try {
            for await (const chunk of completion) {
              const token = chunk.choices[0]?.delta?.content;
              if (token) {
                const data = JSON.stringify({ token });
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              }
            }

            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (streamError) {
            console.error('Stream error:', streamError);
            const fallback = JSON.stringify({
              token: 'I noticed some meaningful reflections in your writing. Take a moment to sit with what you\'ve expressed.'
            });
            controller.enqueue(encoder.encode(`data: ${fallback}\n\n`));
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
      console.error('AI error:', aiError);

      // Return a meaningful fallback response
      const fallbackInsights: Record<string, string> = {
        reflection: 'Your writing shows thoughtful self-reflection. Consider: What would you tell a friend in your situation?',
        emotions: 'Your entry expresses a complex mix of emotions. This self-expression is valuable for processing your experiences.',
        growth: 'Every journal entry is a step toward self-understanding. What small action could you take based on what you\'ve written?',
        creative: 'Your words paint a picture of your inner landscape. What colors or textures come to mind when you read this back?',
      };

      const fallback = fallbackInsights[insightType] || fallbackInsights.reflection;

      const stream = new ReadableStream({
        start(controller) {
          const meta = JSON.stringify({ type: insightType, archetype, fallback: true });
          controller.enqueue(encoder.encode(`data: ${meta}\n\n`));
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
    console.error('Insights error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
