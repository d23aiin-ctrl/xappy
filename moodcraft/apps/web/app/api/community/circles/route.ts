import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const circles = await prisma.community.findMany({
      where: { isActive: true },
      include: {
        memberships: {
          where: { userId: session.user.id },
        },
      },
    });

    const formatted = circles.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      archetype: c.archetype,
      memberCount: c.memberCount,
      maxMembers: c.maxMembers,
      isMember: c.memberships.length > 0,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Circles fetch error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, archetype } = await req.json();

    const circle = await prisma.community.create({
      data: {
        name,
        description,
        archetype,
        memberships: {
          create: { userId: session.user.id },
        },
        memberCount: 1,
      },
    });

    return NextResponse.json({ success: true, data: { id: circle.id } });
  } catch (error) {
    console.error('Circle create error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
