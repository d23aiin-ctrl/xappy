import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['INDIVIDUAL', 'HR', 'THERAPIST']).optional().default('INDIVIDUAL'),
  organizationCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password, name, role, organizationCode } = parsed.data;

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    let organizationId: string | undefined;
    if (organizationCode && (role === 'HR' || role === 'INDIVIDUAL')) {
      const org = await prisma.organization.findUnique({
        where: { domain: organizationCode },
      });
      if (org) {
        organizationId = org.id;
      }
    }

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        role,
        organizationId,
      },
    });

    // Create user profile
    await prisma.userProfile.create({
      data: {
        userId: user.id,
        displayName: name,
      },
    });

    // Create onboarding data record
    if (role === 'INDIVIDUAL') {
      await prisma.onboardingData.create({
        data: { userId: user.id },
      });
    }

    return NextResponse.json(
      { success: true, data: { id: user.id, email: user.email, role: user.role } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
