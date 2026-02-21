import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Create escalation record
    const escalation = await prisma.escalation.create({
      data: {
        userId: session.user.id,
        trigger: 'MANUAL_SOS',
        status: 'PENDING',
        riskScore: 50,
        triggerData: { source: 'manual_request', requestedAt: new Date().toISOString() },
      },
    });

    // Log the escalation
    await prisma.escalationLog.create({
      data: {
        escalationId: escalation.id,
        action: 'created',
        details: { trigger: 'MANUAL_SOS', source: 'escalation_page' },
        actorId: session.user.id,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'escalation.manual_request',
        resource: 'escalation',
        resourceId: escalation.id,
        details: { trigger: 'MANUAL_SOS' },
      },
    });

    return NextResponse.json({ success: true, data: { escalationId: escalation.id } });
  } catch (error) {
    console.error('Therapist request error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
