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

    const { dominantEmotions, baseline, volatility } = await req.json();

    const calibrationData = { dominantEmotions, baseline, volatility };
    const encryptedCalibration = encrypt(JSON.stringify(calibrationData));

    await prisma.onboardingData.update({
      where: { userId: session.user.id },
      data: {
        moodCalibrationEnc: encryptedCalibration,
        moodCalibrationAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mood calibration save error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
