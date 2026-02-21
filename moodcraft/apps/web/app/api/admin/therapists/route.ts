import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - List all therapist applications (for admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check for admin role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch all therapist profiles with user data
    const therapists = await prisma.therapistProfile.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const applications = therapists.map((t) => ({
      id: t.id,
      userId: t.userId,
      name: t.user.name || 'Unknown',
      email: t.user.email,
      licenseNumber: t.licenseNumber,
      licenseState: t.licenseState,
      yearsExperience: t.yearsExperience,
      specializations: t.specializations,
      languages: t.languages,
      bio: t.bio,
      approachDescription: t.approachDescription,
      qualifications: t.qualifications as any[],
      isVerified: t.isVerified,
      isAvailable: t.isAvailable,
      verificationStatus: t.isVerified ? 'APPROVED' : 'PENDING',
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error('Admin therapist list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
