import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check for admin role
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!adminUser || (adminUser.role !== 'ADMIN' && adminUser.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { therapistProfileId, action, reason } = body;

    if (!therapistProfileId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request. Provide therapistProfileId and action (approve/reject)' },
        { status: 400 }
      );
    }

    // Get the therapist profile
    const therapistProfile = await prisma.therapistProfile.findUnique({
      where: { id: therapistProfileId },
      include: { user: { select: { email: true, name: true } } },
    });

    if (!therapistProfile) {
      return NextResponse.json({ error: 'Therapist profile not found' }, { status: 404 });
    }

    if (action === 'approve') {
      // Approve the therapist
      await prisma.$transaction(async (tx) => {
        // Update therapist profile
        await tx.therapistProfile.update({
          where: { id: therapistProfileId },
          data: {
            isVerified: true,
            isAvailable: true,
          },
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            actorId: session.user.id,
            action: 'therapist.verified',
            resource: 'therapist_profile',
            resourceId: therapistProfileId,
            details: {
              therapistEmail: therapistProfile.user.email,
              therapistName: therapistProfile.user.name,
              approvedAt: new Date().toISOString(),
            },
          },
        });
      });

      // TODO: Send approval email notification to therapist
      // await sendEmail(therapistProfile.user.email, 'Your CereBro therapist application has been approved', ...)

      return NextResponse.json({
        success: true,
        message: 'Therapist verified successfully',
        data: {
          therapistProfileId,
          status: 'APPROVED',
        },
      });
    } else {
      // Reject the therapist
      if (!reason) {
        return NextResponse.json(
          { error: 'Rejection reason is required' },
          { status: 400 }
        );
      }

      await prisma.$transaction(async (tx) => {
        // Update therapist profile
        await tx.therapistProfile.update({
          where: { id: therapistProfileId },
          data: {
            isVerified: false,
            isAvailable: false,
          },
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            actorId: session.user.id,
            action: 'therapist.rejected',
            resource: 'therapist_profile',
            resourceId: therapistProfileId,
            details: {
              therapistEmail: therapistProfile.user.email,
              therapistName: therapistProfile.user.name,
              reason,
              rejectedAt: new Date().toISOString(),
            },
          },
        });
      });

      // TODO: Send rejection email notification to therapist
      // await sendEmail(therapistProfile.user.email, 'Update on your CereBro therapist application', ...)

      return NextResponse.json({
        success: true,
        message: 'Therapist application rejected',
        data: {
          therapistProfileId,
          status: 'REJECTED',
          reason,
        },
      });
    }
  } catch (error) {
    console.error('Therapist verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
