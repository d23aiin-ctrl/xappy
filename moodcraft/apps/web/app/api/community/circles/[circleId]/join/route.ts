import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { circleId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { circleId } = params;

    // Check if circle exists
    const circle = await prisma.community.findUnique({
      where: { id: circleId },
      include: {
        memberships: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!circle) {
      return NextResponse.json({ success: false, error: 'Circle not found' }, { status: 404 });
    }

    // Check if already a member
    if (circle.memberships.length > 0) {
      return NextResponse.json({ success: false, error: 'Already a member' }, { status: 400 });
    }

    // Check if circle is full
    if (circle.memberCount >= circle.maxMembers) {
      return NextResponse.json({ success: false, error: 'Circle is full' }, { status: 400 });
    }

    // Join the circle
    await prisma.$transaction([
      prisma.circleMembership.create({
        data: {
          userId: session.user.id,
          communityId: circleId,
        },
      }),
      prisma.community.update({
        where: { id: circleId },
        data: { memberCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true, message: 'Joined circle successfully' });
  } catch (error) {
    console.error('Circle join error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { circleId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { circleId } = params;

    // Check membership
    const membership = await prisma.circleMembership.findUnique({
      where: {
        userId_communityId: {
          userId: session.user.id,
          communityId: circleId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ success: false, error: 'Not a member' }, { status: 400 });
    }

    // Leave the circle
    await prisma.$transaction([
      prisma.circleMembership.delete({
        where: {
          userId_communityId: {
            userId: session.user.id,
            communityId: circleId,
          },
        },
      }),
      prisma.community.update({
        where: { id: circleId },
        data: { memberCount: { decrement: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true, message: 'Left circle successfully' });
  } catch (error) {
    console.error('Circle leave error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
