import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { searchMemories, getConversationContext, buildContextPrompt } from '@/lib/ai/memory-rag';

// POST - Search user's memories semantically
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { query, types, limit = 5 } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    const memories = await searchMemories(session.user.id, query, {
      limit,
      types,
      minSimilarity: 0.4,
    });

    return NextResponse.json({
      success: true,
      data: {
        memories,
        count: memories.length,
      },
    });
  } catch (error) {
    console.error('Memory search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Get conversation context for companion chat
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
    }

    const context = await getConversationContext(session.user.id, query);
    const contextPrompt = buildContextPrompt(context.relevantMemories, context.userSummary);

    return NextResponse.json({
      success: true,
      data: {
        ...context,
        contextPrompt,
      },
    });
  } catch (error) {
    console.error('Context fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
