import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { responses } = await req.json();

    if (!Array.isArray(responses)) {
      return NextResponse.json({ success: false, error: 'Invalid responses' }, { status: 400 });
    }

    // Encrypt all responses as a single JSON blob
    const encryptedData = encrypt(JSON.stringify(
      responses.map((r: any) => ({
        promptId: r.promptId,
        category: r.category,
        response: r.response || '',
        wordCount: r.response ? r.response.split(/\s+/).filter(Boolean).length : 0,
      }))
    ));

    // Store in onboarding data using correct schema field names
    await prisma.onboardingData.upsert({
      where: { userId: session.user.id },
      update: {
        traumaResponsesEnc: encryptedData,
        traumaCompletedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        traumaResponsesEnc: encryptedData,
        traumaCompletedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Trauma quest save error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
