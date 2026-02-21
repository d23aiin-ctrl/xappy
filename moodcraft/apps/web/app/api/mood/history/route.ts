import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const entries = await prisma.moodEntry.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: {
        id: true,
        emoji: true,
        moodScore: true,
        reflectionEnc: true,
        phq9Score: true,
        gad7Score: true,
        createdAt: true,
      },
    });

    // Decrypt reflections for display
    const decryptedEntries = entries.map((entry) => ({
      id: entry.id,
      emoji: entry.emoji,
      moodScore: entry.moodScore,
      reflection: entry.reflectionEnc ? decrypt(entry.reflectionEnc) : null,
      phq9Score: entry.phq9Score,
      gad7Score: entry.gad7Score,
      createdAt: entry.createdAt,
    }));

    return NextResponse.json({ entries: decryptedEntries });
  } catch (error) {
    console.error('Failed to fetch mood history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
