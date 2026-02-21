import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Check file size (max 25MB for Whisper)
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Audio file too large. Maximum size is 25MB.' },
        { status: 400 }
      );
    }

    // Convert File to buffer for OpenAI
    const buffer = Buffer.from(await audioFile.arrayBuffer());

    // Create a File object that OpenAI can use
    const file = new File([buffer], audioFile.name || 'audio.webm', {
      type: audioFile.type || 'audio/webm',
    });

    // Call Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en', // Auto-detect if not specified
      response_format: 'text',
    });

    return NextResponse.json({
      success: true,
      text: transcription,
    });
  } catch (error) {
    console.error('Transcription error:', error);

    // Handle specific OpenAI errors
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { success: false, error: 'Invalid API key' },
          { status: 500 }
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { success: false, error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Transcription failed' },
      { status: 500 }
    );
  }
}
