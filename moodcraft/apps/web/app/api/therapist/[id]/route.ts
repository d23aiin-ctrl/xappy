import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Get therapist profile by ID (public info for connected users)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if user has an active escalation with this therapist
    // OR if the therapist profile is being viewed by a user with consent
    const hasAccess = await prisma.escalation.findFirst({
      where: {
        userId: session.user.id,
        therapistId: id,
        status: { in: ['THERAPIST_ASSIGNED', 'IN_PROGRESS'] },
      },
    });

    if (!hasAccess && session.user.role !== 'ADMIN') {
      // Allow viewing basic info only
    }

    const therapist = await prisma.therapistProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    if (!therapist) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    // Return public profile info
    return NextResponse.json({
      success: true,
      data: {
        id: therapist.id,
        name: therapist.user.name,
        avatarUrl: therapist.user.image || therapist.avatarUrl,
        bio: therapist.bio,
        specializations: therapist.specializations,
        languages: therapist.languages,
        yearsExperience: therapist.yearsExperience,
        approachDescription: therapist.approachDescription,
        qualifications: therapist.qualifications,
        isVerified: therapist.isVerified,
        isAvailable: therapist.isAvailable,
      },
    });
  } catch (error) {
    console.error('Therapist profile fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
