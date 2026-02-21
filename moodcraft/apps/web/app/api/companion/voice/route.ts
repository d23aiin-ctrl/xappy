import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/encryption';
import { buildCompanionSystemPrompt, detectRiskKeywords, CRISIS_RESPONSE } from '@/lib/ai/companion-prompts';
import { getConversationContext, buildContextPrompt, indexUserContent } from '@/lib/ai/memory-rag';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Voice-specific system prompt additions
const VOICE_PROMPT_ADDITION = `

IMPORTANT: You are in voice mode. Keep responses brief and conversational:
- Use 1-3 sentences maximum
- Speak naturally, as if in a real conversation
- Avoid bullet points or lists
- Use contractions and casual language
- End with a brief question to keep dialogue flowing`;

// POST - Handle voice message (transcription + AI response + TTS)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;
    const textMessage = formData.get('text') as string | null;
    const chatId = formData.get('chatId') as string | null;
    const voiceId = (formData.get('voiceId') as string) || 'nova';

    let userMessage = textMessage || '';

    // Transcribe audio if provided
    if (audioFile && audioFile.size > 0) {
      try {
        const transcription = await openai.audio.transcriptions.create({
          file: audioFile,
          model: 'whisper-1',
          language: 'en',
        });
        userMessage = transcription.text;
      } catch (transcribeError) {
        console.error('Transcription error:', transcribeError);
        return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: 500 });
      }
    }

    if (!userMessage?.trim()) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    // Get user context
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

    // Check for risk keywords
    const riskKeywords = detectRiskKeywords(userMessage);
    const riskFlagged = riskKeywords.length > 0;

    // Save user message
    await prisma.companionMessage.create({
      data: {
        chatId: chat.id,
        role: 'user',
        contentEnc: encrypt(userMessage),
        riskFlagged,
        riskKeywords: riskKeywords.length > 0 ? riskKeywords : undefined,
      },
    });

    // Handle risk detection
    if (riskFlagged) {
      await prisma.escalation.create({
        data: {
          userId: session.user.id,
          trigger: 'KEYWORD_DETECTED',
          triggerData: { keywords: riskKeywords, source: 'voice_chat' },
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

      // Generate TTS for crisis response
      const audioResponse = await generateTTS(CRISIS_RESPONSE, voiceId);

      return NextResponse.json({
        success: true,
        data: {
          chatId: chat.id,
          userMessage,
          response: CRISIS_RESPONSE,
          audioUrl: audioResponse,
          riskFlagged: true,
        },
      });
    }

    // Get RAG memory context
    const memoryContext = await getConversationContext(session.user.id, userMessage);
    const ragContextPrompt = buildContextPrompt(memoryContext.relevantMemories, memoryContext.userSummary);

    // Build voice-optimized system prompt
    const baseSystemPrompt = buildCompanionSystemPrompt({
      archetype: profile?.archetype || 'DRIFTER',
      currentMood: recentMood?.moodScore,
      streakDays: profile?.streakDays,
      userName: session.user.name?.split(' ')[0],
    });

    const systemPrompt = baseSystemPrompt + ragContextPrompt + VOICE_PROMPT_ADDITION;

    // Get conversation history
    const recentMessages = await prisma.companionMessage.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: 'desc' },
      take: 6, // Fewer messages for voice context
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
          { role: 'user', content: userMessage },
        ],
        max_tokens: 150, // Shorter for voice
        temperature: 0.8,
      });

      responseText = completion.choices[0]?.message?.content || "I'm here with you. What's on your mind?";
    } catch (aiError) {
      console.error('AI error:', aiError);
      responseText = "I hear you. Tell me more about that.";
    }

    // Save assistant response
    const savedMessage = await prisma.companionMessage.create({
      data: {
        chatId: chat.id,
        role: 'assistant',
        contentEnc: encrypt(responseText),
      },
    });

    // Index for RAG
    indexUserContent(session.user.id, 'chat', savedMessage.id, `User: ${userMessage}\nAssistant: ${responseText}`, {
      chatId: chat.id,
      archetype: profile?.archetype,
      isVoice: true,
    }).catch(err => console.error('Failed to index voice chat:', err));

    // Generate TTS
    const audioUrl = await generateTTS(responseText, voiceId);

    return NextResponse.json({
      success: true,
      data: {
        chatId: chat.id,
        userMessage,
        response: responseText,
        audioUrl,
        riskFlagged: false,
      },
    });
  } catch (error) {
    console.error('Voice companion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function generateTTS(text: string, voice: string): Promise<string | null> {
  try {
    // Validate voice ID
    const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    const selectedVoice = validVoices.includes(voice) ? voice : 'nova';

    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: selectedVoice as any,
      input: text,
      response_format: 'mp3',
    });

    // Convert to base64 for frontend playback
    const buffer = Buffer.from(await mp3.arrayBuffer());
    const base64Audio = buffer.toString('base64');

    return `data:audio/mp3;base64,${base64Audio}`;
  } catch (ttsError) {
    console.error('TTS error:', ttsError);
    return null;
  }
}

// GET - Available voices for voice mode
export async function GET() {
  const voices = [
    { id: 'nova', name: 'Nova', description: 'Warm and conversational', gender: 'female' },
    { id: 'shimmer', name: 'Shimmer', description: 'Gentle and expressive', gender: 'female' },
    { id: 'alloy', name: 'Alloy', description: 'Balanced and neutral', gender: 'neutral' },
    { id: 'echo', name: 'Echo', description: 'Deep and contemplative', gender: 'male' },
    { id: 'fable', name: 'Fable', description: 'Warm and British', gender: 'neutral' },
    { id: 'onyx', name: 'Onyx', description: 'Strong and authoritative', gender: 'male' },
  ];

  return NextResponse.json({ success: true, data: { voices } });
}
