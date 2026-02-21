import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';
import { scoreACE } from '@/lib/scoring/ace';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { responses, timeTakenMs } = await req.json();
    const aceResult = scoreACE(responses);

    // Encrypt the raw responses
    const encryptedResponses = encrypt(JSON.stringify(responses));

    await prisma.onboardingData.update({
      where: { userId: session.user.id },
      data: {
        aceResponsesEnc: encryptedResponses,
        aceScore: aceResult.totalScore,
        aceCompletedAt: new Date(),
        aceTimeTakenMs: timeTakenMs,
      },
    });

    return NextResponse.json({ success: true, data: { score: aceResult.totalScore } });
  } catch (error) {
    console.error('ACE save error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
