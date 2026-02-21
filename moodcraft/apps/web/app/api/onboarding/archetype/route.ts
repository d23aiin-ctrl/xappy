import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { calculateArchetype, type ArchetypeInput } from '@/lib/scoring/archetype';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const onboarding = await prisma.onboardingData.findUnique({
      where: { userId: session.user.id },
    });

    if (!onboarding) {
      return NextResponse.json({ success: false, error: 'Onboarding data not found' }, { status: 404 });
    }

    // If archetype already assigned, return it
    if (onboarding.assignedArchetype) {
      const profile = await prisma.userProfile.findUnique({
        where: { userId: session.user.id },
      });
      return NextResponse.json({
        success: true,
        data: {
          archetype: onboarding.assignedArchetype,
          description: getArchetypeDescription(onboarding.assignedArchetype),
          companionTone: getCompanionTone(onboarding.assignedArchetype),
          confidence: 0.8,
        },
      });
    }

    // Calculate archetype from onboarding data
    const aceResponses = onboarding.aceResponsesEnc ? JSON.parse(decrypt(onboarding.aceResponsesEnc)) : {};
    const moodCalibration = onboarding.moodCalibrationEnc ? JSON.parse(decrypt(onboarding.moodCalibrationEnc)) : {
      dominantEmotions: [],
      baseline: 5,
      volatility: 0.5,
    };

    // Calculate category scores from ACE responses
    const aceCategoryScores = { abuse: 0, neglect: 0, household: 0 };
    const categories: Record<number, 'abuse' | 'neglect' | 'household'> = {
      1: 'abuse', 2: 'abuse', 3: 'abuse',
      4: 'neglect', 5: 'neglect',
      6: 'household', 7: 'household', 8: 'household', 9: 'household', 10: 'household',
    };
    Object.entries(aceResponses).forEach(([id, val]) => {
      if (val && categories[Number(id)]) {
        aceCategoryScores[categories[Number(id)]]++;
      }
    });

    const input: ArchetypeInput = {
      aceScore: onboarding.aceScore || 0,
      aceCategoryScores,
      moodCalibration: {
        dominantEmotions: moodCalibration.dominantEmotions || [],
        volatility: moodCalibration.volatility || 0.5,
        baseline: moodCalibration.baseline || 5,
      },
      traumaResponses: {
        avoidance: 2,
        hypervigilance: 2,
        dissociation: 1,
        connection: 3,
      },
      timeTakenMs: onboarding.aceTimeTakenMs || 180000,
    };

    const result = calculateArchetype(input);

    // Save the archetype
    await prisma.onboardingData.update({
      where: { userId: session.user.id },
      data: {
        assignedArchetype: result.primary,
        archetypeScores: result.scores as any,
        archetypeRevealedAt: new Date(),
      },
    });

    await prisma.userProfile.update({
      where: { userId: session.user.id },
      data: { archetype: result.primary },
    });

    return NextResponse.json({
      success: true,
      data: {
        archetype: result.primary,
        description: result.description,
        companionTone: result.companionTone,
        confidence: result.confidence,
      },
    });
  } catch (error) {
    console.error('Archetype calculation error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

function getArchetypeDescription(archetype: string): string {
  const descriptions: Record<string, string> = {
    DRIFTER: 'You float between worlds, seeking connection and meaning. Your sensitivity is your greatest strength.',
    THINKER: 'You process deeply, analyzing patterns within patterns. Your mind is a labyrinth of insight.',
    TRANSFORMER: 'You have walked through fire and emerged changed. Your resilience inspires transformation.',
    SEEKER: 'You search for safety and belonging. Your courage to seek help shows profound strength.',
    VETERAN: 'You have weathered many storms. Your experience has forged wisdom and quiet strength.',
  };
  return descriptions[archetype] || descriptions.DRIFTER;
}

function getCompanionTone(archetype: string): string {
  const tones: Record<string, string> = {
    DRIFTER: 'Gentle and playful, like a trusted friend who never judges',
    THINKER: 'Structured and thoughtful, offering frameworks and evidence',
    TRANSFORMER: 'Empowering and affirming, celebrating your strength',
    SEEKER: 'Safe and patient, never rushing, always present',
    VETERAN: 'Direct and honest, respecting your experience',
  };
  return tones[archetype] || tones.DRIFTER;
}
