import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    const consents = await prisma.userConsent.findMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      notifications: {
        dailyReminder: true,
        moodCheckIn: true,
        weeklyInsights: true,
        achievements: true,
      },
      privacy: {
        shareWithTherapist: consents.some(c => c.consentType === 'THERAPIST_ACCESS' && c.granted),
        corporateAnalytics: consents.some(c => c.consentType === 'CORPORATE_ANALYTICS' && c.granted),
        researchParticipation: consents.some(c => c.consentType === 'RESEARCH' && c.granted),
      },
      preferences: {
        theme: 'dark',
        reminderTime: '09:00',
        timezone: profile?.timezone || 'UTC',
      },
    });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { privacy, preferences } = body;

    // Update profile timezone
    if (preferences?.timezone) {
      await prisma.userProfile.upsert({
        where: { userId: session.user.id },
        update: {
          timezone: preferences.timezone,
        },
        create: {
          userId: session.user.id,
          timezone: preferences.timezone || 'UTC',
        },
      });
    }

    // Update consents
    const consentTypes = [
      { type: 'THERAPIST_ACCESS', granted: privacy?.shareWithTherapist },
      { type: 'CORPORATE_ANALYTICS', granted: privacy?.corporateAnalytics },
      { type: 'RESEARCH', granted: privacy?.researchParticipation },
    ];

    for (const consent of consentTypes) {
      if (consent.granted !== undefined) {
        await prisma.userConsent.upsert({
          where: {
            userId_consentType: {
              userId: session.user.id,
              consentType: consent.type as any,
            },
          },
          update: {
            granted: consent.granted,
            grantedAt: consent.granted ? new Date() : null,
            revokedAt: !consent.granted ? new Date() : null,
          },
          create: {
            userId: session.user.id,
            consentType: consent.type as any,
            granted: consent.granted,
            grantedAt: consent.granted ? new Date() : null,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
