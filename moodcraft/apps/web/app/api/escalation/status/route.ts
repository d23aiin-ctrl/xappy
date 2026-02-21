import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Get user's current escalation status and assigned therapist info
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's most recent active escalation
    const escalation = await prisma.escalation.findFirst({
      where: {
        userId: session.user.id,
        status: { in: ['PENDING', 'AI_TWIN_REVIEW', 'THERAPIST_ASSIGNED', 'IN_PROGRESS'] },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        therapist: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!escalation) {
      return NextResponse.json({
        success: true,
        data: {
          hasActiveEscalation: false,
          escalation: null,
          therapist: null,
        },
      });
    }

    // Format therapist info if assigned
    let therapistData = null;
    if (escalation.therapist) {
      therapistData = {
        id: escalation.therapist.id,
        name: escalation.therapist.user.name,
        avatarUrl: escalation.therapist.user.image || escalation.therapist.avatarUrl,
        bio: escalation.therapist.bio,
        specializations: escalation.therapist.specializations,
        languages: escalation.therapist.languages,
        yearsExperience: escalation.therapist.yearsExperience,
        approachDescription: escalation.therapist.approachDescription,
        qualifications: escalation.therapist.qualifications,
        isVerified: escalation.therapist.isVerified,
        isAvailable: escalation.therapist.isAvailable,
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        hasActiveEscalation: true,
        escalation: {
          id: escalation.id,
          status: escalation.status,
          trigger: escalation.trigger,
          createdAt: escalation.createdAt,
        },
        therapist: therapistData,
      },
    });
  } catch (error) {
    console.error('Escalation status fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
