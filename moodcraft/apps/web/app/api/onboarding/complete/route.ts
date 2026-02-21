import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.userProfile.update({
      where: { userId: session.user.id },
      data: {
        onboardingDone: true,
        lastActiveAt: new Date(),
      },
    });

    // Create initial badges
    const firstStepsBadge = await prisma.badge.findUnique({ where: { slug: 'first-steps' } });
    if (firstStepsBadge) {
      await prisma.userBadge.upsert({
        where: {
          userId_badgeId: { userId: session.user.id, badgeId: firstStepsBadge.id },
        },
        update: {},
        create: { userId: session.user.id, badgeId: firstStepsBadge.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Onboarding complete error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
