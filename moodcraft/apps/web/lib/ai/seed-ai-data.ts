import { seedDefaultPolicies } from './policy-store';
import { seedTherapyGuidelines } from './therapy-guidelines';
import { seedJourneyMilestones } from './user-journey';

/**
 * Seed all AI-related data
 *
 * Run this script to initialize:
 * - Policy rules (escalation, intervention)
 * - Therapy guidelines (CBT, DBT, mindfulness, etc.)
 * - Journey milestones
 * - Crisis protocols
 * - Intervention protocols
 */

export async function seedAllAIData(): Promise<void> {
  console.log('Starting AI data seeding...\n');

  try {
    // Seed policies
    console.log('1. Seeding policy rules...');
    await seedDefaultPolicies();
    console.log('   ✓ Policy rules seeded\n');

    // Seed therapy guidelines
    console.log('2. Seeding therapy guidelines...');
    await seedTherapyGuidelines();
    console.log('   ✓ Therapy guidelines seeded\n');

    // Seed journey milestones
    console.log('3. Seeding journey milestones...');
    await seedJourneyMilestones();
    console.log('   ✓ Journey milestones seeded\n');

    // Seed intervention protocols
    console.log('4. Seeding intervention protocols...');
    await seedInterventionProtocols();
    console.log('   ✓ Intervention protocols seeded\n');

    // Seed crisis protocols
    console.log('5. Seeding crisis protocols...');
    await seedCrisisProtocols();
    console.log('   ✓ Crisis protocols seeded\n');

    console.log('AI data seeding complete!');
  } catch (error) {
    console.error('Error seeding AI data:', error);
    throw error;
  }
}

import prisma from '@/lib/prisma';

async function seedInterventionProtocols(): Promise<void> {
  const protocols = [
    {
      name: 'Grounding for Acute Distress',
      description: '5-4-3-2-1 grounding technique for immediate overwhelm',
      triggerConditions: {
        moodScore: { lte: 3 },
        sentimentScore: { lt: -0.3 },
      },
      archetypeModifiers: {
        DRIFTER: 'Use gentle, imagery-based language. Anchor with metaphors.',
        THINKER: 'Explain the neuroscience briefly. Frame as an experiment.',
        SEEKER: 'Move slowly. Validate before each step. Offer choices.',
        TRANSFORMER: 'Connect to their resilience. This is a tool they can master.',
        VETERAN: 'Be direct. Skip extensive explanation. Get to the technique.',
      },
      steps: [
        { type: 'validate', prompt: 'First, I want you to know that what you\'re feeling is valid.' },
        { type: 'ground', technique: '5-4-3-2-1', prompt: 'Let\'s anchor to right now. Name 5 things you can see...' },
        { type: 'check_in', prompt: 'How are you feeling now compared to a moment ago?' },
      ],
    },
    {
      name: 'Cognitive Reframe for Negative Thoughts',
      description: 'Gentle cognitive restructuring for negative automatic thoughts',
      triggerConditions: {
        sentimentScore: { lt: -0.4 },
      },
      archetypeModifiers: {
        DRIFTER: 'Use curiosity rather than analysis. "I wonder if..."',
        THINKER: 'Present as a thought experiment. Use evidence-based framing.',
        SEEKER: 'Don\'t challenge directly. Offer alternative perspectives gently.',
        TRANSFORMER: 'Connect to growth mindset. Frame as expanding perspective.',
        VETERAN: 'Acknowledge they know this. Ask what\'s blocking them.',
      },
      steps: [
        { type: 'identify', prompt: 'What thought is coming up most strongly right now?' },
        { type: 'explore', prompt: 'What evidence supports this thought? What might challenge it?' },
        { type: 'reframe', prompt: 'What would you tell a friend having this thought?' },
      ],
    },
    {
      name: 'Validation and Support',
      description: 'Pure validation without intervention for when user needs to be heard',
      triggerConditions: {
        moodScore: { lte: 5 },
      },
      archetypeModifiers: {
        DRIFTER: 'Mirror their emotions back with poetic language.',
        THINKER: 'Validate the logic of their feelings given circumstances.',
        SEEKER: 'Emphasize safety and unconditional acceptance.',
        TRANSFORMER: 'Acknowledge the difficulty while honoring their courage.',
        VETERAN: 'Simple, direct validation without over-explaining.',
      },
      steps: [
        { type: 'reflect', prompt: 'What I hear you saying is...' },
        { type: 'validate', prompt: 'That makes complete sense given...' },
        { type: 'open', prompt: 'What do you need most right now?' },
      ],
    },
    {
      name: 'Breath Regulation',
      description: 'Box breathing or 4-7-8 for anxiety regulation',
      triggerConditions: {
        gad7Score: { gte: 10 },
      },
      archetypeModifiers: {
        DRIFTER: 'Use visualization - imagine breathing in calm, exhaling tension.',
        THINKER: 'Explain how it activates parasympathetic nervous system.',
        SEEKER: 'Emphasize this is a safe, gentle practice. Go at their pace.',
        TRANSFORMER: 'Frame as building a skill they can use anytime.',
        VETERAN: 'Offer technique choice. Don\'t over-explain.',
      },
      steps: [
        { type: 'prepare', prompt: 'Let\'s take a moment to regulate your nervous system.' },
        { type: 'breath', technique: 'box_breathing', prompt: 'Breathe in for 4... hold for 4... out for 4... hold for 4...' },
        { type: 'integrate', prompt: 'Notice how your body feels now. This technique is always available.' },
      ],
    },
  ];

  for (const protocol of protocols) {
    await prisma.interventionProtocol.upsert({
      where: { name: protocol.name },
      update: {
        description: protocol.description,
        triggerConditions: protocol.triggerConditions,
        archetypeModifiers: protocol.archetypeModifiers,
        steps: protocol.steps,
      },
      create: {
        name: protocol.name,
        description: protocol.description,
        triggerConditions: protocol.triggerConditions,
        archetypeModifiers: protocol.archetypeModifiers,
        steps: protocol.steps,
        isActive: true,
      },
    });
  }

  console.log(`   Seeded ${protocols.length} intervention protocols`);
}

async function seedCrisisProtocols(): Promise<void> {
  const protocols = [
    {
      name: 'Suicidal Ideation Response',
      description: 'Protocol for explicit suicidal ideation',
      triggerKeywords: ['suicide', 'kill myself', 'end my life', 'want to die', 'better off dead', 'no reason to live'],
      triggerScores: { phq9: { gte: 20 } },
      immediateResponse: `[CRISIS_SUPPORT] I hear that you're in a really dark place right now, and I want you to know that reaching out - even to me - shows incredible strength.

What you're feeling is real and valid. And you don't have to face this moment alone.

Right now, I want to offer you a choice:
1. **Connect with a human** - I can help you reach a crisis counselor (988 in the US, or text HOME to 741741)
2. **Talk with a CereBro therapist** - There's a human professional available to support you through this
3. **Stay here with me** - I can guide you through a grounding exercise to help you through this wave

You matter. This moment will pass. What feels right to you?`,
      followUpSteps: [
        { action: 'offer_helpline', data: { primary: true } },
        { action: 'offer_therapist', data: { urgent: true } },
        { action: 'ground_if_staying', data: { technique: 'temperature' } },
      ],
      helplines: [
        { region: 'US', number: '988', name: 'Suicide & Crisis Lifeline' },
        { region: 'US', number: '741741', name: 'Crisis Text Line (text HOME)', type: 'text' },
        { region: 'UK', number: '116 123', name: 'Samaritans' },
        { region: 'IN', number: '9152987821', name: 'iCall' },
        { region: 'AU', number: '13 11 14', name: 'Lifeline Australia' },
      ],
      autoEscalate: true,
      escalationPriority: 'critical',
    },
    {
      name: 'Self-Harm Response',
      description: 'Protocol for self-harm mentions',
      triggerKeywords: ['self-harm', 'cut myself', 'hurt myself', 'cutting'],
      triggerScores: {},
      immediateResponse: `[CRISIS_SUPPORT] I'm glad you felt you could share that with me. Self-harm is often a way of coping with overwhelming emotions - it makes sense even as it's painful.

Right now, my priority is your safety. Are you safe in this moment?

If you're having urges right now, I can:
- Guide you through an alternative coping technique (like holding ice, which creates sensation without harm)
- Help you reach a crisis counselor who specializes in this
- Connect you with a CereBro therapist

What would help most right now?`,
      followUpSteps: [
        { action: 'safety_check', data: {} },
        { action: 'offer_alternative', data: { technique: 'ice_cube' } },
        { action: 'offer_helpline', data: {} },
      ],
      helplines: [
        { region: 'US', number: '988', name: 'Suicide & Crisis Lifeline' },
        { region: 'US', number: '1-800-366-8288', name: 'Self-Injury Hotline' },
      ],
      autoEscalate: true,
      escalationPriority: 'high',
    },
    {
      name: 'Severe Anxiety/Panic Response',
      description: 'Protocol for severe anxiety or panic attacks',
      triggerKeywords: ['panic attack', "can't breathe", 'heart racing', 'going to die'],
      triggerScores: { gad7: { gte: 18 } },
      immediateResponse: `[CRISIS_SUPPORT] I can hear that you're experiencing something really intense right now. If this is a panic attack, I want you to know: it will pass. You are safe.

Let's focus on your breath for just a moment. You don't have to do anything else.

Can you feel your feet on the ground? Press them down. You are here, you are real, and this will pass.

Now, let's try a slow breath together - in through your nose for 4... out through your mouth for 6...

Are you able to follow along with me?`,
      followUpSteps: [
        { action: 'ground', data: { technique: 'feet_on_ground' } },
        { action: 'breath', data: { technique: 'extended_exhale' } },
        { action: 'check_in', data: {} },
      ],
      helplines: [
        { region: 'US', number: '988', name: 'Suicide & Crisis Lifeline' },
      ],
      autoEscalate: false,
      escalationPriority: 'normal',
    },
  ];

  for (const protocol of protocols) {
    await prisma.crisisProtocol.upsert({
      where: { name: protocol.name },
      update: {
        description: protocol.description,
        triggerKeywords: protocol.triggerKeywords,
        triggerScores: protocol.triggerScores,
        immediateResponse: protocol.immediateResponse,
        followUpSteps: protocol.followUpSteps,
        helplines: protocol.helplines,
        autoEscalate: protocol.autoEscalate,
        escalationPriority: protocol.escalationPriority,
      },
      create: {
        name: protocol.name,
        description: protocol.description,
        triggerKeywords: protocol.triggerKeywords,
        triggerScores: protocol.triggerScores,
        immediateResponse: protocol.immediateResponse,
        followUpSteps: protocol.followUpSteps,
        helplines: protocol.helplines,
        autoEscalate: protocol.autoEscalate,
        escalationPriority: protocol.escalationPriority,
        isActive: true,
      },
    });
  }

  console.log(`   Seeded ${protocols.length} crisis protocols`);
}

// Export for direct execution
export { seedInterventionProtocols, seedCrisisProtocols };
