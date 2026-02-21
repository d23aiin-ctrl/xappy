import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { hashHMAC } from '@/lib/encryption';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify therapist role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { therapistProfile: true },
    });

    if (!user || (user.role !== 'THERAPIST' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    const therapistProfile = user.therapistProfile;

    // Get pending escalations (not assigned to any therapist)
    const pendingCases = await prisma.escalation.findMany({
      where: {
        status: { in: ['PENDING', 'AI_TWIN_REVIEW'] },
        therapistId: null,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Get active cases assigned to this therapist
    const activeCases = therapistProfile
      ? await prisma.escalation.findMany({
          where: {
            therapistId: therapistProfile.id,
            status: { in: ['THERAPIST_ASSIGNED', 'IN_PROGRESS'] },
          },
          orderBy: { createdAt: 'desc' },
        })
      : [];

    // Get resolved count
    const resolvedCount = therapistProfile
      ? await prisma.escalation.count({
          where: {
            therapistId: therapistProfile.id,
            status: { in: ['RESOLVED', 'CLOSED'] },
          },
        })
      : 0;

    // Check consent for each case
    const formatCase = async (escalation: any) => {
      const consent = await prisma.userConsent.findUnique({
        where: {
          userId_consentType: {
            userId: escalation.userId,
            consentType: 'THERAPIST_ACCESS',
          },
        },
      });

      return {
        id: escalation.id,
        status: escalation.status,
        trigger: escalation.trigger,
        riskScore: escalation.riskScore,
        createdAt: escalation.createdAt.toISOString(),
        userAnonymousId: hashHMAC(escalation.userId).slice(0, 12),
        hasConsent: consent?.granted || false,
      };
    };

    const formattedPending = await Promise.all(pendingCases.map(formatCase));
    const formattedActive = await Promise.all(activeCases.map(formatCase));

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          isVerified: therapistProfile?.isVerified || false,
          currentCaseload: therapistProfile?.currentCaseload || 0,
          maxCaseload: therapistProfile?.maxCaseload || 20,
        },
        pendingCases: formattedPending,
        activeCases: formattedActive,
        resolvedCount,
      },
    });
  } catch (error) {
    console.error('Clinical dashboard error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
