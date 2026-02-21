import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateCaseBrief } from '@/lib/ai/ai-twin';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify therapist role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || (user.role !== 'THERAPIST' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    const { escalationId } = await req.json();
    if (!escalationId) {
      return NextResponse.json({ success: false, error: 'Escalation ID is required' }, { status: 400 });
    }

    // Get escalation
    const escalation = await prisma.escalation.findUnique({
      where: { id: escalationId },
    });

    if (!escalation) {
      return NextResponse.json({ success: false, error: 'Escalation not found' }, { status: 404 });
    }

    // Check consent status
    const consent = await prisma.userConsent.findUnique({
      where: {
        userId_consentType: {
          userId: escalation.userId,
          consentType: 'THERAPIST_ACCESS',
        },
      },
    });

    // Generate AI Twin brief
    const brief = await generateCaseBrief(escalation.userId, escalationId);

    // Log audit event
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'CASE_BRIEF_GENERATED',
        resource: 'escalation',
        resourceId: escalationId,
        details: {
          hasConsent: consent?.granted || false,
          briefGenerated: true,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        brief,
        hasConsent: consent?.granted || false,
        escalationId,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Brief generation error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
