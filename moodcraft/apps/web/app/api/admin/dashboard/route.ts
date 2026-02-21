import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    // Get metrics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [totalUsers, activeToday, newThisWeek, escalationsOpen] = await Promise.all([
      prisma.user.count(),
      prisma.userProfile.count({ where: { lastActiveAt: { gte: today } } }),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.escalation.count({ where: { status: { notIn: ['RESOLVED', 'CLOSED'] } } }),
    ]);

    // Get recent users
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, email: true, role: true, createdAt: true },
    });

    // Get recent audit logs
    const recentAuditLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, action: true, actorId: true, createdAt: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        metrics: { totalUsers, activeToday, newThisWeek, escalationsOpen },
        recentUsers: recentUsers.map((u) => ({
          id: u.id,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt.toISOString(),
        })),
        recentAuditLogs: recentAuditLogs.map((l) => ({
          id: l.id,
          action: l.action,
          actorId: l.actorId,
          createdAt: l.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
