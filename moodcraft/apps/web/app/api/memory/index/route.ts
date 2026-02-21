import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { indexUserContent, backfillUserMemories } from '@/lib/ai/memory-rag';

// POST - Index new content (called by other services when content is created)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contentType, contentId, content, metadata } = body;

    if (!contentType || !contentId || !content) {
      return NextResponse.json(
        { error: 'contentType, contentId, and content are required' },
        { status: 400 }
      );
    }

    await indexUserContent(
      session.user.id,
      contentType,
      contentId,
      content,
      metadata || {}
    );

    return NextResponse.json({
      success: true,
      message: 'Content indexed successfully',
    });
  } catch (error) {
    console.error('Memory index error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Backfill existing content for a user
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await backfillUserMemories(session.user.id);

    return NextResponse.json({
      success: true,
      data: result,
      message: `Indexed ${result.indexed} items with ${result.errors} errors`,
    });
  } catch (error) {
    console.error('Memory backfill error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
