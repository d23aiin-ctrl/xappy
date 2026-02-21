import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';
import { scorePHQ9 } from '@/lib/scoring/phq9';
import { scoreGAD7 } from '@/lib/scoring/gad7';
import { indexUserContent } from '@/lib/ai/memory-rag';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { emoji, emojiSecondary, moodScore, reflection, narrativeResponses } = body;

    // Calculate PHQ-9 and GAD-7 from narrative responses
    const phq9Responses: Record<number, number> = {};
    const gad7Responses: Record<number, number> = {};

    Object.entries(narrativeResponses || {}).forEach(([id, val]) => {
      const numId = Number(id);
      if (numId <= 4) phq9Responses[numId] = val as number;
      if (numId >= 5) gad7Responses[numId - 4] = val as number;
    });

    const phq9Result = scorePHQ9(phq9Responses);
    const gad7Result = scoreGAD7(gad7Responses);

    // Encrypt reflection
    const encryptedReflection = reflection ? encrypt(reflection) : null;

    // Get sentiment from NLP service (if available)
    let sentimentScore = 0;
    let sentimentLabel = 'neutral';
    if (reflection) {
      try {
        const nlpRes = await fetch(`${process.env.NLP_SERVICE_URL}/api/sentiment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: reflection }),
        });
        if (nlpRes.ok) {
          const nlpData = await nlpRes.json();
          sentimentScore = nlpData.score;
          sentimentLabel = nlpData.label;
        }
      } catch {
        // NLP service unavailable, continue without sentiment
      }
    }

    const moodEntry = await prisma.moodEntry.create({
      data: {
        userId: session.user.id,
        emoji,
        emojiSecondary,
        moodScore,
        reflectionEnc: encryptedReflection,
        phq9Score: phq9Result.totalScore,
        gad7Score: gad7Result.totalScore,
        phq9Responses,
        gad7Responses,
        sentimentScore,
        sentimentLabel,
      },
    });

    // Update streak
    await updateStreak(session.user.id);

    // Check for escalation triggers
    if (phq9Result.requiresAttention || gad7Result.requiresAttention) {
      await checkEscalation(session.user.id, phq9Result.totalScore, gad7Result.totalScore);
    }

    // Index mood reflection for RAG retrieval (fire and forget)
    if (reflection) {
      indexUserContent(session.user.id, 'mood', moodEntry.id, reflection, {
        emoji,
        moodScore,
        phq9Score: phq9Result.totalScore,
        gad7Score: gad7Result.totalScore,
        sentimentLabel,
      }).catch(err => console.error('Failed to index mood:', err));
    }

    return NextResponse.json({ success: true, data: { id: moodEntry.id } });
  } catch (error) {
    console.error('Mood save error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const limit = Number(url.searchParams.get('limit')) || 30;

    const entries = await prisma.moodEntry.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        emoji: true,
        moodScore: true,
        phq9Score: true,
        gad7Score: true,
        sentimentLabel: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: entries });
  } catch (error) {
    console.error('Mood fetch error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

async function updateStreak(userId: string) {
  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  if (!profile) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActive = profile.lastActiveAt ? new Date(profile.lastActiveAt) : null;
  lastActive?.setHours(0, 0, 0, 0);

  let newStreak = profile.streakDays;
  if (lastActive && lastActive.getTime() === yesterday.getTime()) {
    newStreak++;
  } else if (!lastActive || lastActive.getTime() < yesterday.getTime()) {
    newStreak = 1;
  }

  await prisma.userProfile.update({
    where: { userId },
    data: { streakDays: newStreak, lastActiveAt: new Date() },
  });
}

async function checkEscalation(userId: string, phq9: number, gad7: number) {
  const triggers = [];
  if (phq9 >= 15) triggers.push('PHQ9_CRITICAL');
  if (gad7 >= 15) triggers.push('GAD7_CRITICAL');

  if (triggers.length > 0) {
    await prisma.escalation.create({
      data: {
        userId,
        trigger: triggers[0] as any,
        triggerData: { phq9, gad7, triggers },
        riskScore: Math.max(phq9, gad7) / 27 * 100,
      },
    });
  }
}
