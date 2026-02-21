import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import redis from '@/lib/redis';
import crypto from 'crypto';

// HMAC verification for API authentication
function verifyHMAC(apiKey: string, signature: string, body: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', apiKey)
    .update(body)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(req: NextRequest) {
  try {
    // Get API key from header
    const apiKey = req.headers.get('X-API-Key');
    const signature = req.headers.get('X-Signature');

    if (!apiKey || !signature) {
      return NextResponse.json({ error: 'Missing authentication' }, { status: 401 });
    }

    const body = await req.text();

    // Verify API key exists and is active
    const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    const apiKeyRecord = await prisma.insuranceApiKey.findUnique({
      where: { apiKeyHash },
    });

    if (!apiKeyRecord || !apiKeyRecord.isActive) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    // Verify HMAC signature
    if (!verifyHMAC(apiKeyRecord.secretHash, signature, body)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitKey = `insurance:ratelimit:${apiKeyRecord.id}`;
    const currentCount = await redis.incr(rateLimitKey);
    if (currentCount === 1) {
      await redis.expire(rateLimitKey, 3600); // 1 hour window
    }
    if (currentCount > apiKeyRecord.rateLimit) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { tokenized_user_ids } = JSON.parse(body);

    if (!Array.isArray(tokenized_user_ids) || tokenized_user_ids.length === 0) {
      return NextResponse.json({ error: 'tokenized_user_ids array required' }, { status: 400 });
    }

    // Check cache first
    const cacheKey = (id: string) => `insurance:score:${id}`;
    const scores = [];

    for (const tokenizedId of tokenized_user_ids) {
      // Try cache
      const cached = await redis.get(cacheKey(tokenizedId));
      if (cached) {
        scores.push(JSON.parse(cached));
        continue;
      }

      // Get from database
      const riskScore = await prisma.insuranceRiskScore.findFirst({
        where: { tokenizedUserId: tokenizedId },
        orderBy: { computedAt: 'desc' },
      });

      if (riskScore) {
        const scoreData = {
          tokenized_user_id: tokenizedId,
          composite_score: riskScore.compositeScore,
          ritual_adherence: riskScore.ritualAdherence,
          sentiment_avg: riskScore.sentimentAvg,
          computed_at: riskScore.computedAt.toISOString(),
        };
        scores.push(scoreData);

        // Cache for 1 hour
        await redis.setex(cacheKey(tokenizedId), 3600, JSON.stringify(scoreData));
      }
    }

    return NextResponse.json({ scores }, { status: 200 });
  } catch (error) {
    console.error('Insurance API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
