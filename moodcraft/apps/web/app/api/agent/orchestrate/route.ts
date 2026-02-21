import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { runAgentOrchestrator, AgentStep } from '@/lib/ai/agent-orchestrator';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Streaming response for real-time agent updates
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await request.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Run agent in background and stream steps
    (async () => {
      try {
        await runAgentOrchestrator(
          session.user.id,
          message,
          async (step: AgentStep) => {
            const data = JSON.stringify(step);
            await writer.write(encoder.encode(`data: ${data}\n\n`));
          }
        );
        await writer.write(encoder.encode('data: [DONE]\n\n'));
      } catch (error) {
        console.error('Agent error:', error);
        const errorStep: AgentStep = {
          type: 'response',
          content: 'I encountered an issue. Please try again.',
          timestamp: Date.now(),
        };
        await writer.write(encoder.encode(`data: ${JSON.stringify(errorStep)}\n\n`));
        await writer.write(encoder.encode('data: [DONE]\n\n'));
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Agent orchestration error:', error);
    return NextResponse.json(
      { error: 'Failed to run agent' },
      { status: 500 }
    );
  }
}

// Non-streaming version for simpler integrations
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await request.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const result = await runAgentOrchestrator(session.user.id, message);

    return NextResponse.json({
      success: true,
      data: {
        steps: result.steps,
        response: result.finalResponse,
      },
    });
  } catch (error) {
    console.error('Agent orchestration error:', error);
    return NextResponse.json(
      { error: 'Failed to run agent' },
      { status: 500 }
    );
  }
}
