import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';
import { indexUserContent } from '@/lib/ai/memory-rag';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, promptId, isVoiceEntry } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 });
    }

    const encryptedTitle = title ? encrypt(title) : null;
    const encryptedContent = encrypt(content);
    const wordCount = content.split(/\s+/).filter(Boolean).length;

    // Get sentiment from NLP service
    let sentimentScore = 0;
    let sentimentLabel = 'neutral';
    let emotionTags: string[] = [];

    try {
      const nlpRes = await fetch(`${process.env.NLP_SERVICE_URL}/api/sentiment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content }),
      });
      if (nlpRes.ok) {
        const nlpData = await nlpRes.json();
        sentimentScore = nlpData.score;
        sentimentLabel = nlpData.label;
        emotionTags = nlpData.emotions || [];
      }
    } catch {
      // NLP service unavailable
    }

    const entry = await prisma.journalEntry.create({
      data: {
        userId: session.user.id,
        titleEnc: encryptedTitle,
        contentEnc: encryptedContent,
        promptId,
        wordCount,
        sentimentScore,
        sentimentLabel,
        emotionTags,
        isVoiceEntry: isVoiceEntry || false,
      },
    });

    // Update user activity
    await prisma.userProfile.update({
      where: { userId: session.user.id },
      data: { lastActiveAt: new Date() },
    });

    // Index journal entry for RAG retrieval (fire and forget)
    const indexContent = title ? `${title}\n\n${content}` : content;
    indexUserContent(session.user.id, 'journal', entry.id, indexContent, {
      title,
      sentimentScore,
      sentimentLabel,
      emotionTags,
    }).catch(err => console.error('Failed to index journal:', err));

    return NextResponse.json({ success: true, data: { id: entry.id } });
  } catch (error) {
    console.error('Journal save error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const limit = Number(url.searchParams.get('limit')) || 20;

    const entries = await prisma.journalEntry.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        wordCount: true,
        sentimentLabel: true,
        createdAt: true,
        titleEnc: true,
      },
    });

    // Note: In production, you'd decrypt titles here
    const formatted = entries.map((e) => ({
      id: e.id,
      title: e.titleEnc ? 'Entry' : 'Untitled',
      wordCount: e.wordCount,
      sentimentLabel: e.sentimentLabel,
      createdAt: e.createdAt,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Journal fetch error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
