import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      licenseNumber,
      licenseState,
      yearsExperience,
      specializations,
      languages,
      bio,
      approachDescription,
      qualifications,
    } = body;

    // Validate required fields
    if (!name || !email || !password || !licenseNumber || !licenseState) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hash(password, 12);

    // Create user with therapist role and profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: 'THERAPIST',
        },
      });

      // Create therapist profile
      const therapistProfile = await tx.therapistProfile.create({
        data: {
          userId: user.id,
          licenseNumber,
          licenseState,
          yearsExperience: yearsExperience || null,
          specializations: specializations || [],
          languages: languages || ['English'],
          bio: bio || null,
          approachDescription: approachDescription || null,
          qualifications: qualifications || [],
          isVerified: false, // Admin must verify
          isAvailable: false, // Until verified
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: 'therapist.registered',
          resource: 'therapist_profile',
          resourceId: therapistProfile.id,
          details: {
            licenseNumber,
            licenseState,
            specializations,
          },
        },
      });

      return { user, therapistProfile };
    });

    return NextResponse.json({
      success: true,
      data: {
        userId: result.user.id,
        profileId: result.therapistProfile.id,
        message: 'Registration submitted for verification',
      },
    });
  } catch (error) {
    console.error('Therapist registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
