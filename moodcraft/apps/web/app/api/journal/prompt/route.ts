import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Fallback prompts if none in database
const FALLBACK_PROMPTS = [
  { id: 'fb1', text: 'What moment today made you feel most alive?', category: 'gratitude' },
  { id: 'fb2', text: 'If your emotions were weather, what would today\'s forecast be?', category: 'mindfulness' },
  { id: 'fb3', text: 'Write a letter to your younger self about something they need to hear.', category: 'shadow_work' },
  { id: 'fb4', text: 'What is one boundary you need to set or reinforce?', category: 'cbt' },
  { id: 'fb5', text: 'Describe a fear you carry. Where do you feel it in your body?', category: 'expressive' },
  { id: 'fb6', text: 'What would you do today if you weren\'t afraid?', category: 'growth' },
  { id: 'fb7', text: 'Name three things you\'re grateful for, no matter how small.', category: 'gratitude' },
  { id: 'fb8', text: 'What patterns do you notice repeating in your life?', category: 'shadow_work' },
];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's archetype for personalized prompts
    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      select: { archetype: true },
    });

    // Get recent journal entries to avoid repeating prompts
    const recentEntries = await prisma.journalEntry.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { promptId: true, sentimentLabel: true },
    });

    const usedPromptIds = recentEntries.map((e) => e.promptId).filter(Boolean);
    const recentSentiments = recentEntries.map((e) => e.sentimentLabel);

    // Try to get a prompt from database
    let prompt = await prisma.journalPrompt.findFirst({
      where: {
        isActive: true,
        id: { notIn: usedPromptIds as string[] },
        OR: [
          { archetype: null },
          { archetype: profile?.archetype },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    // Adaptive prompt selection based on sentiment trajectory
    if (!prompt) {
      // Use fallback prompts
      const availableFallbacks = FALLBACK_PROMPTS.filter((p) => !usedPromptIds.includes(p.id));

      // If recent sentiments are negative, prefer supportive prompts
      const negativeCount = recentSentiments.filter((s) => s === 'negative').length;
      let selectedPrompt;

      if (negativeCount >= 2) {
        selectedPrompt = availableFallbacks.find((p) => p.category === 'gratitude') || availableFallbacks[0];
      } else {
        selectedPrompt = availableFallbacks[Math.floor(Math.random() * availableFallbacks.length)];
      }

      return NextResponse.json({
        success: true,
        data: selectedPrompt || FALLBACK_PROMPTS[0],
      });
    }

    return NextResponse.json({
      success: true,
      data: { id: prompt.id, text: prompt.text, category: prompt.category },
    });
  } catch (error) {
    console.error('Prompt fetch error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
