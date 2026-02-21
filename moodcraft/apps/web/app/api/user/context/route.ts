import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * User Context API
 *
 * GET - Get user's socio-economic context
 * PUT - Update user's context
 *
 * This data is completely optional and user-provided.
 * It helps the AI Twin provide more personalized support.
 */

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const context = await prisma.userContext.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      success: true,
      data: context || { message: 'No context set yet. This is optional.' },
    });
  } catch (error) {
    console.error('Get user context error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Validate allowed fields
    const allowedFields = [
      'employmentStatus',
      'livingArrangement',
      'relationshipStatus',
      'hasChildren',
      'socialSupportLevel',
      'hasPrimarySupport',
      'currentStressors',
      'majorLifeEvents',
      'culturalBackground',
      'religiousSpiritual',
      'sleepQuality',
      'exerciseFrequency',
      'substanceUse',
      'preferredCopingStyles',
    ];

    const updateData: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const context = await prisma.userContext.upsert({
      where: { userId: session.user.id },
      update: updateData,
      create: {
        userId: session.user.id,
        ...updateData,
      },
    });

    return NextResponse.json({
      success: true,
      data: context,
    });
  } catch (error) {
    console.error('Update user context error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.userContext.delete({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      success: true,
      message: 'User context deleted',
    });
  } catch (error) {
    // Not found is OK
    if ((error as any).code === 'P2025') {
      return NextResponse.json({
        success: true,
        message: 'No context to delete',
      });
    }
    console.error('Delete user context error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
