import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Get current therapist's own profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const therapist = await prisma.therapistProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!therapist) {
      return NextResponse.json({ error: 'Therapist profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: therapist.id,
        name: therapist.user.name,
        email: therapist.user.email,
        avatarUrl: therapist.user.image || therapist.avatarUrl,
        bio: therapist.bio,
        licenseNumber: therapist.licenseNumber,
        licenseState: therapist.licenseState,
        specializations: therapist.specializations,
        languages: therapist.languages,
        yearsExperience: therapist.yearsExperience,
        approachDescription: therapist.approachDescription,
        qualifications: therapist.qualifications,
        isVerified: therapist.isVerified,
        isAvailable: therapist.isAvailable,
        maxCaseload: therapist.maxCaseload,
        currentCaseload: therapist.currentCaseload,
      },
    });
  } catch (error) {
    console.error('Therapist profile fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update therapist's own profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a therapist
    const existingProfile = await prisma.therapistProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!existingProfile) {
      return NextResponse.json({ error: 'Therapist profile not found' }, { status: 404 });
    }

    const body = await req.json();
    const {
      bio,
      specializations,
      languages,
      approachDescription,
      isAvailable,
      avatarUrl,
    } = body;

    // Update profile (only fields therapists can edit themselves)
    const updatedProfile = await prisma.therapistProfile.update({
      where: { userId: session.user.id },
      data: {
        ...(bio !== undefined && { bio }),
        ...(specializations !== undefined && { specializations }),
        ...(languages !== undefined && { languages }),
        ...(approachDescription !== undefined && { approachDescription }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'therapist.profile_updated',
        resource: 'therapist_profile',
        resourceId: updatedProfile.id,
        details: { updatedFields: Object.keys(body) },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedProfile,
    });
  } catch (error) {
    console.error('Therapist profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
