import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Fetch user's nudges
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const nudges = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        type: 'RITUAL_REMINDER',
        ...(unreadOnly && { isRead: false }),
      },
      orderBy: { sentAt: 'desc' },
      take: limit,
    });

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        type: 'RITUAL_REMINDER',
        isRead: false,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        nudges: nudges.map((n) => ({
          id: n.id,
          title: n.title,
          body: n.body,
          isRead: n.isRead,
          sentAt: n.sentAt.toISOString(),
          data: n.data,
        })),
        unreadCount,
      },
    });
  } catch (error) {
    console.error('Nudges fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Mark nudges as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { nudgeIds, markAllRead } = body;

    if (markAllRead) {
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          type: 'RITUAL_REMINDER',
          isRead: false,
        },
        data: { isRead: true },
      });
    } else if (nudgeIds && Array.isArray(nudgeIds)) {
      await prisma.notification.updateMany({
        where: {
          id: { in: nudgeIds },
          userId: session.user.id,
          type: 'RITUAL_REMINDER',
        },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Nudges update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
