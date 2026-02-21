import { PrismaClient, Archetype, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Demo encryption (in production, use real AES-256)
function mockEncrypt(text: string): string {
  return Buffer.from(text).toString('base64');
}

// Generate dates relative to now
function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function hoursAgo(hours: number): Date {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date;
}

async function main() {
  console.log('🧠 Seeding CereBro database with demo data...\n');

  // ═══════════════════════════════════════════════════════════════════
  // BADGES
  // ═══════════════════════════════════════════════════════════════════
  const badges = [
    { slug: 'first-steps', name: 'First Steps', description: 'Completed onboarding', icon: '🌱', category: 'milestone', criteria: { type: 'milestone', resource: 'onboarding', value: 1 } },
    { slug: 'first-breath', name: 'First Breath', description: 'Completed your first breathing session', icon: '🌬️', category: 'breath', criteria: { type: 'first', resource: 'breath', value: 1 } },
    { slug: 'breath-streak-7', name: 'Breath Master', description: '7-day breathing streak', icon: '💨', category: 'breath', criteria: { type: 'streak', resource: 'breath', value: 7 } },
    { slug: 'breath-streak-30', name: 'Zen Master', description: '30-day breathing streak', icon: '🧘', category: 'breath', criteria: { type: 'streak', resource: 'breath', value: 30 } },
    { slug: 'journal-first', name: 'Ink Begins', description: 'Wrote your first journal entry', icon: '✍️', category: 'journal', criteria: { type: 'first', resource: 'journal', value: 1 } },
    { slug: 'journal-10', name: 'Journeyer', description: 'Wrote 10 journal entries', icon: '📖', category: 'journal', criteria: { type: 'count', resource: 'journal', value: 10 } },
    { slug: 'journal-50', name: 'Chronicle Keeper', description: 'Wrote 50 journal entries', icon: '📚', category: 'journal', criteria: { type: 'count', resource: 'journal', value: 50 } },
    { slug: 'mood-streak-7', name: 'Mood Tracker', description: '7-day mood check-in streak', icon: '🎯', category: 'mood', criteria: { type: 'streak', resource: 'mood', value: 7 } },
    { slug: 'mood-streak-30', name: 'Emotional Explorer', description: '30-day mood check-in streak', icon: '🌈', category: 'mood', criteria: { type: 'streak', resource: 'mood', value: 30 } },
    { slug: 'companion-chat', name: 'First Connection', description: 'First chat with AI companion', icon: '💬', category: 'companion', criteria: { type: 'first', resource: 'companion', value: 1 } },
    { slug: 'companion-100', name: 'Deep Conversations', description: '100 messages with companion', icon: '🗣️', category: 'companion', criteria: { type: 'count', resource: 'companion', value: 100 } },
    { slug: 'streak-7', name: 'Week Warrior', description: '7-day activity streak', icon: '⚡', category: 'streak', criteria: { type: 'streak', resource: 'activity', value: 7 } },
    { slug: 'streak-30', name: 'Steadfast', description: '30-day activity streak', icon: '🔥', category: 'streak', criteria: { type: 'streak', resource: 'activity', value: 30 } },
    { slug: 'streak-100', name: 'Centurion', description: '100-day activity streak', icon: '👑', category: 'streak', criteria: { type: 'streak', resource: 'activity', value: 100 } },
    { slug: 'night-owl', name: 'Night Owl', description: 'Completed a session after midnight', icon: '🦉', category: 'special', criteria: { type: 'time', resource: 'session', value: 'night' } },
    { slug: 'early-bird', name: 'Early Bird', description: 'Completed a session before 6 AM', icon: '🐦', category: 'special', criteria: { type: 'time', resource: 'session', value: 'early' } },
    { slug: 'voice-explorer', name: 'Voice Explorer', description: 'Used voice journaling', icon: '🎤', category: 'special', criteria: { type: 'first', resource: 'voice', value: 1 } },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { slug: badge.slug },
      update: badge,
      create: badge,
    });
  }
  console.log('✅ Created badges');

  // ═══════════════════════════════════════════════════════════════════
  // JOURNAL PROMPTS (50+ prompts)
  // ═══════════════════════════════════════════════════════════════════
  const prompts = [
    // Gratitude
    { text: 'What moment today made you feel most alive?', category: 'gratitude', intensity: 2 },
    { text: 'Name three things you\'re grateful for, no matter how small.', category: 'gratitude', intensity: 1 },
    { text: 'Describe a moment of unexpected kindness you witnessed or received.', category: 'gratitude', intensity: 2 },
    { text: 'What brings you genuine joy, without any conditions?', category: 'gratitude', intensity: 2 },
    { text: 'Who in your life deserves more appreciation? Write them a thank you.', category: 'gratitude', intensity: 2 },

    // Mindfulness
    { text: 'If your emotions were weather, what would today\'s forecast be?', category: 'mindfulness', intensity: 2 },
    { text: 'What would you do today if you weren\'t afraid?', category: 'mindfulness', intensity: 3 },
    { text: 'What does rest look like for you? When did you last truly rest?', category: 'mindfulness', intensity: 2 },
    { text: 'Describe your relationship with uncertainty. How do you cope with not knowing?', category: 'mindfulness', intensity: 3 },
    { text: 'What sounds can you hear right now? What do they make you feel?', category: 'mindfulness', intensity: 1 },

    // Shadow Work
    { text: 'Write a letter to your younger self about something they need to hear.', category: 'shadow_work', intensity: 4 },
    { text: 'What patterns do you notice repeating in your life?', category: 'shadow_work', intensity: 4 },
    { text: 'What emotions are you avoiding right now? Why?', category: 'shadow_work', intensity: 5 },
    { text: 'What does forgiveness mean to you? Is there something you need to forgive?', category: 'shadow_work', intensity: 5 },
    { text: 'What part of yourself do you hide from others? Why?', category: 'shadow_work', intensity: 5 },
    { text: 'Write about a time you felt deeply misunderstood.', category: 'shadow_work', intensity: 4 },

    // CBT
    { text: 'What is one boundary you need to set or reinforce?', category: 'cbt', intensity: 3 },
    { text: 'If your inner critic had a name, what would it be? What does it say?', category: 'cbt', intensity: 4 },
    { text: 'What beliefs about yourself would you like to release?', category: 'cbt', intensity: 4 },
    { text: 'What would you say to a friend in your current situation?', category: 'cbt', intensity: 3 },
    { text: 'List three negative thoughts you had today. Now challenge each one.', category: 'cbt', intensity: 4 },

    // Expressive
    { text: 'Describe a fear you carry. Where do you feel it in your body?', category: 'expressive', intensity: 4 },
    { text: 'Describe a time when you surprised yourself with your own strength.', category: 'expressive', intensity: 3 },
    { text: 'Write about a place where you feel completely safe.', category: 'expressive', intensity: 2 },
    { text: 'If your life was a book, what chapter are you in now?', category: 'expressive', intensity: 3 },
    { text: 'Describe your perfect day, from waking to sleeping.', category: 'expressive', intensity: 2 },

    // Attachment
    { text: 'Write about a relationship that has shaped who you are today.', category: 'attachment', intensity: 4 },
    { text: 'How do you typically respond when someone gets too close?', category: 'attachment', intensity: 4 },
    { text: 'What did love look like in your childhood home?', category: 'attachment', intensity: 5 },
    { text: 'What do you need from others that you struggle to ask for?', category: 'attachment', intensity: 4 },

    // Grief
    { text: 'Write about a loss that still affects you. What did it teach you?', category: 'grief', intensity: 5 },
    { text: 'What do you wish you had said to someone who is no longer here?', category: 'grief', intensity: 5 },
    { text: 'How has grief changed you? What has it taken, and what has it given?', category: 'grief', intensity: 5 },

    // Archetype-specific: DRIFTER
    { text: 'Where do you feel most at home? Is it a place, a person, or a state of mind?', category: 'expressive', intensity: 3, archetype: 'DRIFTER' as Archetype },
    { text: 'What connections in your life feel most authentic?', category: 'attachment', intensity: 3, archetype: 'DRIFTER' as Archetype },

    // Archetype-specific: THINKER
    { text: 'What problem is your mind trying to solve right now?', category: 'cbt', intensity: 3, archetype: 'THINKER' as Archetype },
    { text: 'When does thinking help you, and when does it hold you back?', category: 'mindfulness', intensity: 4, archetype: 'THINKER' as Archetype },

    // Archetype-specific: TRANSFORMER
    { text: 'What old version of yourself are you leaving behind?', category: 'shadow_work', intensity: 4, archetype: 'TRANSFORMER' as Archetype },
    { text: 'What is emerging in you that excites or scares you?', category: 'expressive', intensity: 4, archetype: 'TRANSFORMER' as Archetype },

    // Archetype-specific: SEEKER
    { text: 'What does safety mean to you? When do you feel most safe?', category: 'attachment', intensity: 3, archetype: 'SEEKER' as Archetype },
    { text: 'What small step could you take today toward trust?', category: 'cbt', intensity: 3, archetype: 'SEEKER' as Archetype },

    // Archetype-specific: VETERAN
    { text: 'What wisdom have your struggles given you?', category: 'expressive', intensity: 3, archetype: 'VETERAN' as Archetype },
    { text: 'How do you balance strength with vulnerability?', category: 'shadow_work', intensity: 4, archetype: 'VETERAN' as Archetype },
  ];

  // Clear existing prompts and recreate
  await prisma.journalPrompt.deleteMany({});
  for (const prompt of prompts) {
    await prisma.journalPrompt.create({ data: prompt });
  }
  console.log('✅ Created journal prompts');

  // ═══════════════════════════════════════════════════════════════════
  // COMMUNITIES
  // ═══════════════════════════════════════════════════════════════════
  const communities = [
    { name: 'The Drifters Circle', description: 'A space for those who float between worlds, seeking connection and belonging.', archetype: 'DRIFTER' as Archetype },
    { name: 'Thinkers Assembly', description: 'For deep processors and pattern seekers who find comfort in understanding.', archetype: 'THINKER' as Archetype },
    { name: 'Transformers Guild', description: 'For those walking through change and emerging stronger on the other side.', archetype: 'TRANSFORMER' as Archetype },
    { name: 'Seekers Sanctuary', description: 'A safe haven for those searching for safety, stability, and inner peace.', archetype: 'SEEKER' as Archetype },
    { name: 'Veterans Hall', description: 'For those who have weathered many storms and carry wisdom in their scars.', archetype: 'VETERAN' as Archetype },
    { name: 'Open Circle', description: 'A welcoming space for all journeyers, regardless of where they are in their path.', archetype: null },
  ];

  await prisma.community.deleteMany({});
  for (const community of communities) {
    await prisma.community.create({ data: community });
  }
  console.log('✅ Created communities');

  // ═══════════════════════════════════════════════════════════════════
  // DEMO ORGANIZATION
  // ═══════════════════════════════════════════════════════════════════
  await prisma.corporateSnapshot.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.organization.deleteMany({});

  const org = await prisma.organization.create({
    data: {
      name: 'TechFlow Industries',
      domain: 'techflow.io',
      plan: 'enterprise',
    },
  });

  const departments = await Promise.all([
    prisma.department.create({ data: { name: 'Engineering', organizationId: org.id } }),
    prisma.department.create({ data: { name: 'Product', organizationId: org.id } }),
    prisma.department.create({ data: { name: 'Sales', organizationId: org.id } }),
    prisma.department.create({ data: { name: 'Marketing', organizationId: org.id } }),
    prisma.department.create({ data: { name: 'Operations', organizationId: org.id } }),
  ]);

  // Corporate snapshots for last 30 days
  for (let i = 30; i >= 0; i--) {
    const date = daysAgo(i);
    date.setHours(0, 0, 0, 0);

    for (const dept of departments) {
      const baseStress = dept.name === 'Sales' ? 0.7 : dept.name === 'Engineering' ? 0.5 : 0.4;
      const variation = Math.random() * 0.2 - 0.1;

      await prisma.corporateSnapshot.create({
        data: {
          organizationId: org.id,
          departmentId: dept.id,
          snapshotDate: date,
          avgMoodScore: 5 + Math.random() * 3,
          avgPhq9: Math.floor(5 + Math.random() * 8),
          avgGad7: Math.floor(4 + Math.random() * 7),
          ritualAdherence: 0.5 + Math.random() * 0.4,
          activeUsers: 15 + Math.floor(Math.random() * 10),
          totalUsers: 25,
          stressLevel: baseStress + variation > 0.6 ? 'red' : baseStress + variation > 0.4 ? 'yellow' : 'green',
        },
      });
    }
  }
  console.log('✅ Created organization with corporate data');

  // ═══════════════════════════════════════════════════════════════════
  // ADMIN USER
  // ═══════════════════════════════════════════════════════════════════
  const password = await bcrypt.hash('demo123', 12);

  await prisma.user.upsert({
    where: { email: 'admin@cerebro.app' },
    update: {},
    create: {
      email: 'admin@cerebro.app',
      name: 'System Admin',
      passwordHash: password,
      role: 'SUPER_ADMIN',
      profile: {
        create: { displayName: 'Admin', onboardingDone: true },
      },
    },
  });
  console.log('✅ Created admin: admin@cerebro.app / demo123');

  // ═══════════════════════════════════════════════════════════════════
  // HR USER
  // ═══════════════════════════════════════════════════════════════════
  await prisma.user.upsert({
    where: { email: 'hr@techflow.io' },
    update: {},
    create: {
      email: 'hr@techflow.io',
      name: 'Sarah Mitchell',
      passwordHash: password,
      role: 'HR',
      organizationId: org.id,
      profile: {
        create: { displayName: 'Sarah', onboardingDone: true },
      },
    },
  });
  console.log('✅ Created HR user: hr@techflow.io / demo123');

  // ═══════════════════════════════════════════════════════════════════
  // THERAPIST USER
  // ═══════════════════════════════════════════════════════════════════
  const therapist = await prisma.user.upsert({
    where: { email: 'therapist@cerebro.app' },
    update: {},
    create: {
      email: 'therapist@cerebro.app',
      name: 'Dr. Elena Rodriguez',
      passwordHash: password,
      role: 'THERAPIST',
      profile: {
        create: { displayName: 'Dr. Rodriguez', onboardingDone: true },
      },
    },
  });

  await prisma.therapistProfile.upsert({
    where: { userId: therapist.id },
    update: {},
    create: {
      userId: therapist.id,
      licenseNumber: 'PSY-2024-7892',
      licenseState: 'California',
      specializations: ['trauma', 'anxiety', 'depression', 'PTSD'],
      bio: 'Dr. Rodriguez is a licensed clinical psychologist with over 15 years of experience specializing in trauma-informed care and cognitive behavioral therapy.',
      qualifications: [
        { degree: 'Ph.D. Clinical Psychology', institution: 'Stanford University', year: 2009 },
        { degree: 'M.A. Psychology', institution: 'UCLA', year: 2005 },
      ],
      approachDescription: 'I integrate trauma-informed approaches with evidence-based therapies to create a safe, supportive environment for healing and growth.',
      languages: ['English', 'Spanish'],
      yearsExperience: 15,
      isVerified: true,
      isAvailable: true,
      maxCaseload: 20,
      currentCaseload: 8,
    },
  });
  console.log('✅ Created therapist: therapist@cerebro.app / demo123');

  // ═══════════════════════════════════════════════════════════════════
  // DEMO PERSONAS (5 archetypes with rich data)
  // ═══════════════════════════════════════════════════════════════════

  const allBadges = await prisma.badge.findMany();
  const getBadgeId = (slug: string) => allBadges.find(b => b.slug === slug)?.id;

  // ───────────────────────────────────────────────────────────────────
  // PERSONA 1: Maya Chen - THE DRIFTER
  // ───────────────────────────────────────────────────────────────────
  console.log('\n🌊 Creating Maya Chen (DRIFTER)...');

  const maya = await prisma.user.upsert({
    where: { email: 'maya@demo.cerebro.app' },
    update: {},
    create: {
      email: 'maya@demo.cerebro.app',
      name: 'Maya Chen',
      passwordHash: password,
      role: 'INDIVIDUAL',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya',
    },
  });

  await prisma.userProfile.upsert({
    where: { userId: maya.id },
    update: {},
    create: {
      userId: maya.id,
      archetype: 'DRIFTER',
      displayName: 'Maya',
      onboardingDone: true,
      currentStation: 'ACCEPTANCE',
      streakDays: 23,
      lastActiveAt: hoursAgo(2),
    },
  });

  await prisma.onboardingData.upsert({
    where: { userId: maya.id },
    update: {},
    create: {
      userId: maya.id,
      aceScore: 4,
      aceCompletedAt: daysAgo(45),
      assignedArchetype: 'DRIFTER',
      archetypeScores: { drifter: 0.8, thinker: 0.4, transformer: 0.3, seeker: 0.5, veteran: 0.2 },
      archetypeRevealedAt: daysAgo(45),
    },
  });

  // Maya's mood entries (showing improvement trend)
  const mayaMoods = [
    { emoji: '😔', score: 4, reflection: 'Feeling disconnected today. Like I\'m floating through life without an anchor.', phq9: 12, gad7: 10, days: 30 },
    { emoji: '😕', score: 4.5, reflection: 'Met a friend for coffee but still felt like I was performing rather than connecting.', phq9: 11, gad7: 9, days: 28 },
    { emoji: '🙂', score: 5, reflection: 'The breathing exercise helped me feel more grounded today.', phq9: 10, gad7: 8, days: 25 },
    { emoji: '😊', score: 6, reflection: 'Had a genuine conversation with my sister. It felt real.', phq9: 8, gad7: 7, days: 20 },
    { emoji: '🙂', score: 5.5, reflection: 'Some old feelings of isolation crept back, but I recognized them for what they are.', phq9: 9, gad7: 8, days: 15 },
    { emoji: '😊', score: 6.5, reflection: 'Joined the Drifters Circle community. Reading others\' stories made me feel less alone.', phq9: 7, gad7: 6, days: 10 },
    { emoji: '😌', score: 7, reflection: 'Feeling more at peace with my need for solitude. It\'s not always avoidance.', phq9: 6, gad7: 5, days: 7 },
    { emoji: '😊', score: 7.5, reflection: 'The companion helped me see that drifting can also mean exploring.', phq9: 5, gad7: 4, days: 3 },
    { emoji: '🌟', score: 8, reflection: 'I chose to reach out to someone today instead of waiting. Small victory.', phq9: 4, gad7: 4, days: 1 },
  ];

  for (const mood of mayaMoods) {
    await prisma.moodEntry.create({
      data: {
        userId: maya.id,
        emoji: mood.emoji,
        moodScore: mood.score,
        reflectionEnc: mockEncrypt(mood.reflection),
        phq9Score: mood.phq9,
        gad7Score: mood.gad7,
        sentimentLabel: mood.score > 6 ? 'positive' : mood.score > 4 ? 'neutral' : 'negative',
        createdAt: daysAgo(mood.days),
      },
    });
  }

  // Maya's journal entries
  const mayaJournals = [
    { title: 'The Floating Feeling', content: 'I\'ve always felt like I\'m watching my life from the outside. Like I\'m a ghost in my own story. Today in the grocery store, I saw a family laughing together and felt this ache—not jealousy exactly, but a longing to feel that rooted. To belong somewhere. The companion asked me where I feel most like myself, and I realized it\'s when I\'m alone in nature. Maybe that\'s not running away. Maybe that\'s where I find my anchor.', days: 25 },
    { title: 'Connections', content: 'I reached out to an old friend today. We talked for two hours. The whole time, part of me was waiting for the moment they\'d see through me—see that I\'m not really here, not really present. But they said something that stuck: "Maya, you always listen so deeply." Maybe my floating gives me a different perspective. Maybe I see things others miss because I\'m not anchored to one way of being.', days: 18 },
    { title: 'Finding Ground', content: 'The breathing exercises are changing something in me. For 4-4-4-4 counts, I\'m not floating. I\'m here. In my body. In this moment. It\'s uncomfortable and beautiful at the same time. Today I felt my feet on the ground—really felt them—and almost cried. How long have I been hovering above my own life?', days: 10 },
    { title: 'The Anchor Within', content: 'I understand now that I\'ve been looking for external anchors—people, places, roles—when maybe the anchor has to be internal first. The companion said something that resonated: "What if home is a feeling you can carry?" I\'m learning to be my own harbor.', days: 3 },
  ];

  for (const journal of mayaJournals) {
    await prisma.journalEntry.create({
      data: {
        userId: maya.id,
        titleEnc: mockEncrypt(journal.title),
        contentEnc: mockEncrypt(journal.content),
        wordCount: journal.content.split(' ').length,
        sentimentScore: 0.3,
        sentimentLabel: 'mixed',
        createdAt: daysAgo(journal.days),
      },
    });
  }

  // Maya's companion chat
  const mayaChat = await prisma.companionChat.create({
    data: { userId: maya.id, title: 'Ongoing Journey' },
  });

  const mayaMessages = [
    { role: 'user', content: 'I feel like I don\'t belong anywhere. Even with my closest friends, there\'s this glass wall between us.' },
    { role: 'assistant', content: 'That glass wall feeling sounds isolating, Maya. I\'m curious—when you\'re with your friends, do you notice yourself creating that wall, or does it feel like it appears on its own? Sometimes understanding its origin helps us find the door.' },
    { role: 'user', content: 'I think... I think I create it. To protect myself. But I don\'t know from what.' },
    { role: 'assistant', content: 'That\'s a profound insight. Protection without a clear threat often comes from old wounds we\'ve forgotten. What would it feel like, just for a moment, to imagine that wall becoming a window instead? Still there, but you can see through it more clearly.' },
    { role: 'user', content: 'That\'s a nice image. A window instead of a wall. I could still feel safe but... connected?' },
    { role: 'assistant', content: 'Exactly. And windows can open when you\'re ready. You get to choose when and how much. Would you like to explore what might help you feel safe enough to crack that window open sometimes?' },
  ];

  for (let i = 0; i < mayaMessages.length; i++) {
    await prisma.companionMessage.create({
      data: {
        chatId: mayaChat.id,
        role: mayaMessages[i].role,
        contentEnc: mockEncrypt(mayaMessages[i].content),
        createdAt: hoursAgo(48 - i * 2),
      },
    });
  }

  // Maya's badges
  const mayaBadges = ['first-steps', 'first-breath', 'breath-streak-7', 'journal-first', 'journal-10', 'companion-chat', 'streak-7'];
  for (const slug of mayaBadges) {
    const badgeId = getBadgeId(slug);
    if (badgeId) {
      await prisma.userBadge.create({
        data: { userId: maya.id, badgeId, earnedAt: daysAgo(Math.floor(Math.random() * 30)) },
      });
    }
  }

  // Maya's breath sessions
  for (let i = 0; i < 25; i++) {
    await prisma.breathSession.create({
      data: {
        userId: maya.id,
        breathType: ['BOX', 'FOUR_SEVEN_EIGHT', 'PACED'][Math.floor(Math.random() * 3)] as any,
        durationSecs: 180 + Math.floor(Math.random() * 180),
        completed: true,
        groundingDone: true,
        createdAt: daysAgo(i),
      },
    });
  }

  console.log('   ✅ Maya Chen created with full history');

  // ───────────────────────────────────────────────────────────────────
  // PERSONA 2: James Wright - THE THINKER
  // ───────────────────────────────────────────────────────────────────
  console.log('🧠 Creating James Wright (THINKER)...');

  const james = await prisma.user.upsert({
    where: { email: 'james@demo.cerebro.app' },
    update: {},
    create: {
      email: 'james@demo.cerebro.app',
      name: 'James Wright',
      passwordHash: password,
      role: 'INDIVIDUAL',
      organizationId: org.id,
      departmentId: departments[0].id, // Engineering
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    },
  });

  await prisma.userProfile.upsert({
    where: { userId: james.id },
    update: {},
    create: {
      userId: james.id,
      archetype: 'THINKER',
      displayName: 'James',
      onboardingDone: true,
      currentStation: 'INTEGRATION',
      streakDays: 45,
      lastActiveAt: hoursAgo(1),
    },
  });

  await prisma.onboardingData.upsert({
    where: { userId: james.id },
    update: {},
    create: {
      userId: james.id,
      aceScore: 2,
      aceCompletedAt: daysAgo(60),
      assignedArchetype: 'THINKER',
      archetypeScores: { drifter: 0.3, thinker: 0.9, transformer: 0.4, seeker: 0.3, veteran: 0.4 },
      archetypeRevealedAt: daysAgo(60),
    },
  });

  // James's mood entries (analytical pattern with occasional overthinking episodes)
  const jamesMoods = [
    { emoji: '🤔', score: 6, reflection: 'Mind racing with project concerns. Need to decompose the problem.', phq9: 7, gad7: 10, days: 28 },
    { emoji: '😰', score: 4, reflection: 'Analysis paralysis hit hard today. Couldn\'t decide on the architecture and the anxiety spiraled.', phq9: 9, gad7: 14, days: 25 },
    { emoji: '😌', score: 7, reflection: 'The 4-7-8 breathing broke the overthinking cycle. Need to remember this tool.', phq9: 5, gad7: 6, days: 22 },
    { emoji: '🙂', score: 6.5, reflection: 'Caught myself catastrophizing about the presentation. Applied the CBT reframe technique.', phq9: 6, gad7: 7, days: 18 },
    { emoji: '😊', score: 7.5, reflection: 'Productive day. Mind was clear. The morning journaling seems to offload the mental noise.', phq9: 4, gad7: 5, days: 14 },
    { emoji: '🤔', score: 6, reflection: 'Interesting observation: my anxiety peaks when I have too many unprocessed inputs.', phq9: 6, gad7: 8, days: 10 },
    { emoji: '😊', score: 8, reflection: 'Applied the insight about inputs—limited my information intake. Much calmer.', phq9: 3, gad7: 4, days: 5 },
    { emoji: '🌟', score: 8.5, reflection: 'Best week in months. The system is working: journal, breathe, limit inputs, structured thinking time.', phq9: 2, gad7: 3, days: 1 },
  ];

  for (const mood of jamesMoods) {
    await prisma.moodEntry.create({
      data: {
        userId: james.id,
        emoji: mood.emoji,
        moodScore: mood.score,
        reflectionEnc: mockEncrypt(mood.reflection),
        phq9Score: mood.phq9,
        gad7Score: mood.gad7,
        sentimentLabel: mood.score > 7 ? 'positive' : mood.score > 5 ? 'neutral' : 'negative',
        createdAt: daysAgo(mood.days),
      },
    });
  }

  // James's journal entries
  const jamesJournals = [
    { title: 'The Overthinking Loop', content: 'Mapped out my anxiety cycle today: trigger → analysis → more questions → more analysis → paralysis → anxiety about paralysis. It\'s recursive. The insight from the companion about "good enough" decisions is counter to my nature but probably necessary. Not every decision needs to be optimal. Some just need to be made.', days: 22 },
    { title: 'Systems for Peace', content: 'Hypothesis: my mind needs structure to feel safe. Without a system, it creates chaos trying to account for all variables. New experiment: create bounded thinking time. 30 minutes to analyze, then decide. Treating my mind like a process that needs constraints.', days: 15 },
    { title: 'The Paradox of Understanding', content: 'Realized something profound today: my drive to understand everything is itself a form of anxiety control. If I can understand it, I can predict it. If I can predict it, I\'m safe. But life isn\'t a deterministic system. Some variables are unknowable. The work isn\'t to understand more—it\'s to tolerate uncertainty better.', days: 8 },
    { title: 'Integration', content: 'Combining what I\'ve learned: 1) Bounded analysis time, 2) "Good enough" decisions for reversible choices, 3) Breathing when the loop starts, 4) Accepting that uncertainty is the only certainty. My analytical mind isn\'t the enemy—it\'s a powerful tool that needs wise direction.', days: 2 },
  ];

  for (const journal of jamesJournals) {
    await prisma.journalEntry.create({
      data: {
        userId: james.id,
        titleEnc: mockEncrypt(journal.title),
        contentEnc: mockEncrypt(journal.content),
        wordCount: journal.content.split(' ').length,
        sentimentScore: 0.5,
        sentimentLabel: 'neutral',
        createdAt: daysAgo(journal.days),
      },
    });
  }

  // James's companion chat
  const jamesChat = await prisma.companionChat.create({
    data: { userId: james.id, title: 'Structured Exploration' },
  });

  const jamesMessages = [
    { role: 'user', content: 'I can\'t stop analyzing everything. Even this conversation—I\'m meta-analyzing my own thoughts about my thoughts.' },
    { role: 'assistant', content: 'That recursive awareness is actually a sophisticated cognitive ability, James. The question is whether it\'s serving you right now. What would happen if you gave yourself permission to just... notice a thought once and let it pass?' },
    { role: 'user', content: 'It feels unsafe. Like if I don\'t thoroughly examine something, I\'ll miss a critical flaw.' },
    { role: 'assistant', content: 'That makes sense—analysis has probably protected you many times. But I wonder: for the thoughts you\'re examining right now, what\'s the actual risk if you miss something? Sometimes our minds treat everyday decisions like life-or-death scenarios.' },
    { role: 'user', content: 'When you put it that way... most things aren\'t actually critical. I think I\'ve been running emergency protocols for routine situations.' },
    { role: 'assistant', content: 'That\'s a powerful framework. What if you created different "protocols" for different situation types? Reserve the deep analysis for decisions that truly warrant it, and practice a lighter touch for everything else?' },
  ];

  for (let i = 0; i < jamesMessages.length; i++) {
    await prisma.companionMessage.create({
      data: {
        chatId: jamesChat.id,
        role: jamesMessages[i].role,
        contentEnc: mockEncrypt(jamesMessages[i].content),
        createdAt: hoursAgo(24 - i * 2),
      },
    });
  }

  // James's badges
  const jamesBadges = ['first-steps', 'first-breath', 'breath-streak-7', 'breath-streak-30', 'journal-first', 'journal-10', 'journal-50', 'mood-streak-30', 'companion-chat', 'streak-30'];
  for (const slug of jamesBadges) {
    const badgeId = getBadgeId(slug);
    if (badgeId) {
      await prisma.userBadge.create({
        data: { userId: james.id, badgeId, earnedAt: daysAgo(Math.floor(Math.random() * 45)) },
      });
    }
  }

  // James's breath sessions (very consistent)
  for (let i = 0; i < 45; i++) {
    await prisma.breathSession.create({
      data: {
        userId: james.id,
        breathType: 'FOUR_SEVEN_EIGHT',
        durationSecs: 240,
        completed: true,
        groundingDone: true,
        createdAt: daysAgo(i),
      },
    });
  }

  console.log('   ✅ James Wright created with full history');

  // ───────────────────────────────────────────────────────────────────
  // PERSONA 3: Aisha Patel - THE TRANSFORMER
  // ───────────────────────────────────────────────────────────────────
  console.log('🦋 Creating Aisha Patel (TRANSFORMER)...');

  const aisha = await prisma.user.upsert({
    where: { email: 'aisha@demo.cerebro.app' },
    update: {},
    create: {
      email: 'aisha@demo.cerebro.app',
      name: 'Aisha Patel',
      passwordHash: password,
      role: 'INDIVIDUAL',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha',
    },
  });

  await prisma.userProfile.upsert({
    where: { userId: aisha.id },
    update: {},
    create: {
      userId: aisha.id,
      archetype: 'TRANSFORMER',
      displayName: 'Aisha',
      onboardingDone: true,
      currentStation: 'SYNTHESIS',
      streakDays: 67,
      lastActiveAt: hoursAgo(3),
    },
  });

  await prisma.onboardingData.upsert({
    where: { userId: aisha.id },
    update: {},
    create: {
      userId: aisha.id,
      aceScore: 5,
      aceCompletedAt: daysAgo(90),
      assignedArchetype: 'TRANSFORMER',
      archetypeScores: { drifter: 0.3, thinker: 0.5, transformer: 0.85, seeker: 0.4, veteran: 0.5 },
      archetypeRevealedAt: daysAgo(90),
    },
  });

  // Aisha's mood entries (showing growth through change)
  const aishaMoods = [
    { emoji: '😢', score: 3, reflection: 'The divorce papers arrived. Everything I built is ending. Who am I without this marriage?', phq9: 15, gad7: 12, days: 60 },
    { emoji: '😔', score: 3.5, reflection: 'Grief comes in waves. Today was a tsunami. But I got out of bed. That counts.', phq9: 14, gad7: 11, days: 55 },
    { emoji: '😕', score: 4.5, reflection: 'Started journaling about who I was before the relationship. There\'s someone there I forgot about.', phq9: 12, gad7: 9, days: 45 },
    { emoji: '🙂', score: 5.5, reflection: 'First day I didn\'t cry. Felt guilty about that, then realized healing isn\'t betrayal.', phq9: 10, gad7: 8, days: 35 },
    { emoji: '😊', score: 6.5, reflection: 'Signed up for a pottery class. Something just for me. When did I stop having things just for me?', phq9: 8, gad7: 6, days: 25 },
    { emoji: '😌', score: 7, reflection: 'The companion helped me see that I\'m not falling apart—I\'m falling together. Into a new shape.', phq9: 6, gad7: 5, days: 15 },
    { emoji: '🌟', score: 8, reflection: 'Made pottery today. It was terrible and I loved every minute. I\'m creating again.', phq9: 4, gad7: 4, days: 8 },
    { emoji: '🦋', score: 8.5, reflection: 'Someone asked how I\'m handling the divorce so well. I said: I\'m not handling it—I\'m growing through it.', phq9: 3, gad7: 3, days: 2 },
  ];

  for (const mood of aishaMoods) {
    await prisma.moodEntry.create({
      data: {
        userId: aisha.id,
        emoji: mood.emoji,
        moodScore: mood.score,
        reflectionEnc: mockEncrypt(mood.reflection),
        phq9Score: mood.phq9,
        gad7Score: mood.gad7,
        sentimentLabel: mood.score > 6 ? 'positive' : mood.score > 4 ? 'neutral' : 'negative',
        createdAt: daysAgo(mood.days),
      },
    });
  }

  // Aisha's journal entries
  const aishaJournals = [
    { title: 'The End of Everything', content: 'Twelve years. Gone. I keep looking at my hands and not recognizing them. Whose life is this? Who am I supposed to be now? The therapist says this is normal—the identity dissolution that comes with major life changes. But knowing it\'s normal doesn\'t make it hurt less. I feel like a butterfly being forced back into a cocoon.', days: 58 },
    { title: 'Rediscovering', content: 'Found an old journal from before I was married. The dreams I had. The person I was. She wanted to travel, to create, to be wildly herself. When did I trade her in for safety? The marriage wasn\'t the cage—I built the cage. Maybe the divorce is the key I was too afraid to use.', days: 40 },
    { title: 'Chrysalis', content: 'The companion called me a Transformer today. Said that some people are built for reinvention. That destruction and creation are two sides of the same coin. I\'ve been mourning an ending when maybe I should be preparing for a beginning. What if this isn\'t a breakdown but a breakthrough?', days: 20 },
    { title: 'The New Shape', content: 'I\'m starting to see her—the woman I\'m becoming. She\'s stronger than the one who existed before, more honest, more whole. She knows that falling apart is sometimes the only way to fall together. The cracks are where the light gets in. I\'m not the same. I\'m better.', days: 5 },
  ];

  for (const journal of aishaJournals) {
    await prisma.journalEntry.create({
      data: {
        userId: aisha.id,
        titleEnc: mockEncrypt(journal.title),
        contentEnc: mockEncrypt(journal.content),
        wordCount: journal.content.split(' ').length,
        sentimentScore: 0.4,
        sentimentLabel: 'mixed',
        createdAt: daysAgo(journal.days),
      },
    });
  }

  // Aisha's badges (most collected)
  const aishaBadges = ['first-steps', 'first-breath', 'breath-streak-7', 'breath-streak-30', 'journal-first', 'journal-10', 'journal-50', 'mood-streak-7', 'mood-streak-30', 'companion-chat', 'companion-100', 'streak-30', 'streak-100'];
  for (const slug of aishaBadges) {
    const badgeId = getBadgeId(slug);
    if (badgeId) {
      await prisma.userBadge.create({
        data: { userId: aisha.id, badgeId, earnedAt: daysAgo(Math.floor(Math.random() * 67)) },
      });
    }
  }

  console.log('   ✅ Aisha Patel created with full history');

  // ───────────────────────────────────────────────────────────────────
  // PERSONA 4: Marcus Johnson - THE SEEKER
  // ───────────────────────────────────────────────────────────────────
  console.log('🔍 Creating Marcus Johnson (SEEKER)...');

  const marcus = await prisma.user.upsert({
    where: { email: 'marcus@demo.cerebro.app' },
    update: {},
    create: {
      email: 'marcus@demo.cerebro.app',
      name: 'Marcus Johnson',
      passwordHash: password,
      role: 'INDIVIDUAL',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    },
  });

  await prisma.userProfile.upsert({
    where: { userId: marcus.id },
    update: {},
    create: {
      userId: marcus.id,
      archetype: 'SEEKER',
      displayName: 'Marcus',
      onboardingDone: true,
      currentStation: 'AWARENESS',
      streakDays: 12,
      lastActiveAt: hoursAgo(5),
    },
  });

  await prisma.onboardingData.upsert({
    where: { userId: marcus.id },
    update: {},
    create: {
      userId: marcus.id,
      aceScore: 7,
      aceCompletedAt: daysAgo(30),
      assignedArchetype: 'SEEKER',
      archetypeScores: { drifter: 0.4, thinker: 0.3, transformer: 0.3, seeker: 0.85, veteran: 0.3 },
      archetypeRevealedAt: daysAgo(30),
    },
  });

  // Marcus's mood entries (careful, seeking safety)
  const marcusMoods = [
    { emoji: '😰', score: 3.5, reflection: 'Hard to trust this app with my thoughts. But the therapist said to try. Trying feels dangerous.', phq9: 14, gad7: 16, days: 28 },
    { emoji: '😟', score: 4, reflection: 'The companion didn\'t judge my short responses. That... surprised me.', phq9: 13, gad7: 14, days: 24 },
    { emoji: '😕', score: 4.5, reflection: 'Hypervigilance is exhausting. Always scanning for threats that may not exist.', phq9: 12, gad7: 13, days: 20 },
    { emoji: '🙂', score: 5, reflection: 'The breathing exercises don\'t make me feel trapped. They actually feel... safe?', phq9: 11, gad7: 11, days: 15 },
    { emoji: '🙂', score: 5.5, reflection: 'Wrote more in my journal today. The encryption makes me feel like it\'s really private.', phq9: 10, gad7: 10, days: 10 },
    { emoji: '😊', score: 6, reflection: 'Small win: I shared something in the Seekers community. Anonymous, but still. I shared.', phq9: 9, gad7: 9, days: 5 },
    { emoji: '😌', score: 6.5, reflection: 'The companion remembered something I said last week. It felt like being seen without being exposed.', phq9: 8, gad7: 8, days: 2 },
  ];

  for (const mood of marcusMoods) {
    await prisma.moodEntry.create({
      data: {
        userId: marcus.id,
        emoji: mood.emoji,
        moodScore: mood.score,
        reflectionEnc: mockEncrypt(mood.reflection),
        phq9Score: mood.phq9,
        gad7Score: mood.gad7,
        sentimentLabel: mood.score > 5 ? 'positive' : mood.score > 4 ? 'neutral' : 'negative',
        createdAt: daysAgo(mood.days),
      },
    });
  }

  // Marcus's journal entries (shorter, cautious)
  const marcusJournals = [
    { title: 'Testing the Waters', content: 'The therapist said to try journaling. So here I am. I don\'t know what to say. Everything I write might be used against me someday. But I\'ll try. Small steps.', days: 26 },
    { title: 'What Safety Looks Like', content: 'The prompt asked what safety looks like. For me, it\'s a locked door. It\'s knowing exactly who\'s in the room. It\'s having an exit plan. It\'s... exhausting, actually. Living like every situation might be a threat. I wonder what it\'s like to just... exist without the constant assessment.', days: 18 },
    { title: 'A Different Kind of Safe', content: 'The companion doesn\'t push. When I go quiet, it waits. When I share something small, it treats it like a gift, not an interrogation opportunity. Is this what safety in connection feels like? I\'m not sure, but I want to find out.', days: 8 },
  ];

  for (const journal of marcusJournals) {
    await prisma.journalEntry.create({
      data: {
        userId: marcus.id,
        titleEnc: mockEncrypt(journal.title),
        contentEnc: mockEncrypt(journal.content),
        wordCount: journal.content.split(' ').length,
        sentimentScore: 0.2,
        sentimentLabel: 'mixed',
        createdAt: daysAgo(journal.days),
      },
    });
  }

  // Marcus's badges (fewer, earned carefully)
  const marcusBadges = ['first-steps', 'first-breath', 'journal-first', 'companion-chat', 'streak-7'];
  for (const slug of marcusBadges) {
    const badgeId = getBadgeId(slug);
    if (badgeId) {
      await prisma.userBadge.create({
        data: { userId: marcus.id, badgeId, earnedAt: daysAgo(Math.floor(Math.random() * 20)) },
      });
    }
  }

  console.log('   ✅ Marcus Johnson created with full history');

  // ───────────────────────────────────────────────────────────────────
  // PERSONA 5: Dr. Patricia Webb - THE VETERAN
  // ───────────────────────────────────────────────────────────────────
  console.log('⚔️ Creating Patricia Webb (VETERAN)...');

  const patricia = await prisma.user.upsert({
    where: { email: 'patricia@demo.cerebro.app' },
    update: {},
    create: {
      email: 'patricia@demo.cerebro.app',
      name: 'Dr. Patricia Webb',
      passwordHash: password,
      role: 'INDIVIDUAL',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Patricia',
    },
  });

  await prisma.userProfile.upsert({
    where: { userId: patricia.id },
    update: {},
    create: {
      userId: patricia.id,
      archetype: 'VETERAN',
      displayName: 'Patricia',
      onboardingDone: true,
      currentStation: 'SYNTHESIS',
      streakDays: 89,
      lastActiveAt: hoursAgo(1),
    },
  });

  await prisma.onboardingData.upsert({
    where: { userId: patricia.id },
    update: {},
    create: {
      userId: patricia.id,
      aceScore: 6,
      aceCompletedAt: daysAgo(120),
      assignedArchetype: 'VETERAN',
      archetypeScores: { drifter: 0.2, thinker: 0.6, transformer: 0.5, seeker: 0.3, veteran: 0.9 },
      archetypeRevealedAt: daysAgo(120),
    },
  });

  // Patricia's mood entries (stable, wise, occasionally weathering storms)
  const patriciaMoods = [
    { emoji: '😌', score: 7, reflection: 'The cancer scare last month taught me: I\'ve survived worse. I\'ll survive this too.', phq9: 6, gad7: 5, days: 45 },
    { emoji: '🙂', score: 6.5, reflection: 'Some days the old grief visits. I let it sit with me now instead of fighting it.', phq9: 7, gad7: 6, days: 35 },
    { emoji: '😊', score: 7.5, reflection: 'Mentored a young colleague today. Shared what I wish someone had told me at her age.', phq9: 4, gad7: 4, days: 25 },
    { emoji: '😔', score: 5, reflection: 'Anniversary of Tom\'s death. 15 years. The missing never goes away, but it becomes livable.', phq9: 9, gad7: 7, days: 20 },
    { emoji: '😌', score: 7, reflection: 'Returned to equilibrium after the anniversary. The dips are shorter now. Resilience isn\'t about not falling.', phq9: 5, gad7: 5, days: 15 },
    { emoji: '🌟', score: 8, reflection: 'Grandson asked how I stay so strong. Told him: I\'m not strong because I don\'t break. I\'m strong because I know how to mend.', phq9: 3, gad7: 3, days: 5 },
    { emoji: '😊', score: 8, reflection: 'Good day. The kind where hard-won peace feels natural. These days are the reward for all the work.', phq9: 3, gad7: 2, days: 1 },
  ];

  for (const mood of patriciaMoods) {
    await prisma.moodEntry.create({
      data: {
        userId: patricia.id,
        emoji: mood.emoji,
        moodScore: mood.score,
        reflectionEnc: mockEncrypt(mood.reflection),
        phq9Score: mood.phq9,
        gad7Score: mood.gad7,
        sentimentLabel: mood.score > 6 ? 'positive' : mood.score > 4.5 ? 'neutral' : 'negative',
        createdAt: daysAgo(mood.days),
      },
    });
  }

  // Patricia's journal entries (wisdom-focused)
  const patriciaJournals = [
    { title: 'What Surviving Teaches', content: 'Sixty-three years. Cancer twice. Widowhood. The loss of a child. Career setbacks. Each time I thought: this is the one that will break me. It never was. Not because I\'m exceptional, but because humans are more resilient than we know. We\'re built to survive. The question isn\'t whether we can endure—it\'s who we become in the process.', days: 40 },
    { title: 'The Gift of Scars', content: 'A young woman in the community asked how I deal with trauma. I told her: You don\'t deal with it. You integrate it. It becomes part of your story—not the whole story, but a chapter that informs the rest. My scars don\'t define me, but they certainly shaped me. And I wouldn\'t trade the woman they shaped for anything.', days: 22 },
    { title: 'On Mentoring', content: 'Started mentoring through the platform\'s community feature. These young seekers and transformers—they don\'t need my answers. They need to know that their questions are the right ones. That uncertainty isn\'t weakness. That falling apart is sometimes the most courageous thing you can do.', days: 10 },
    { title: 'Legacy', content: 'What do I want to leave behind? Not accomplishments. Not things. I want to leave behind the knowledge that one ordinary person can weather extraordinary storms and find joy on the other side. That\'s the inheritance I want to give.', days: 3 },
  ];

  for (const journal of patriciaJournals) {
    await prisma.journalEntry.create({
      data: {
        userId: patricia.id,
        titleEnc: mockEncrypt(journal.title),
        contentEnc: mockEncrypt(journal.content),
        wordCount: journal.content.split(' ').length,
        sentimentScore: 0.7,
        sentimentLabel: 'positive',
        createdAt: daysAgo(journal.days),
      },
    });
  }

  // Patricia's badges (all of them)
  const patriciaBadges = ['first-steps', 'first-breath', 'breath-streak-7', 'breath-streak-30', 'journal-first', 'journal-10', 'journal-50', 'mood-streak-7', 'mood-streak-30', 'companion-chat', 'companion-100', 'streak-7', 'streak-30', 'streak-100', 'early-bird'];
  for (const slug of patriciaBadges) {
    const badgeId = getBadgeId(slug);
    if (badgeId) {
      await prisma.userBadge.create({
        data: { userId: patricia.id, badgeId, earnedAt: daysAgo(Math.floor(Math.random() * 89)) },
      });
    }
  }

  console.log('   ✅ Patricia Webb created with full history');

  // ═══════════════════════════════════════════════════════════════════
  // AI TWIN CONVERSATIONS & ESCALATIONS
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n🧠 Creating AI Twin conversations and escalations...');

  // Marcus (SEEKER) - Active AI Twin conversation showing gradual trust building
  const marcusAITwinChat = await prisma.aITwinChat.create({
    data: {
      userId: marcus.id,
      briefSummary: JSON.stringify({
        summary: "Seeker archetype with elevated anxiety scores (GAD-7: 8-16 range). Shows hypervigilance patterns but demonstrating gradual trust building through consistent platform engagement. Recent improvement trend in mood scores.",
        presentingConcerns: ["Trust and safety concerns", "Hypervigilance", "Difficulty with vulnerability"],
        riskAssessment: { level: "moderate", score: 45, factors: ["Historical trust wounds", "Elevated anxiety baseline"] },
        emotionalPatterns: { dominantEmotions: ["anxiety", "caution", "hope"], moodTrajectory: "Gradual improvement", sentimentTrend: "improving" },
        recommendedApproach: ["Slow, predictable interactions", "Validate courage in engaging", "Build trust through consistency"],
      }),
      isActive: true,
    },
  });

  const marcusAITwinMessages = [
    { role: 'user', content: 'Is this conversation really private?', interventionType: null },
    { role: 'assistant', content: "[VALIDATION] I understand that privacy is really important to you, Marcus. Yes, this conversation is encrypted end-to-end. I'm an AI Twin, which means I'm trained specifically on your patterns to support you—but I can only access what you've shared through CereBro. Your data is yours. What would help you feel more comfortable here?", interventionType: 'VALIDATION' },
    { role: 'user', content: 'I don\'t know. I guess I\'m used to people eventually using what I say against me.', interventionType: null },
    { role: 'assistant', content: "[VALIDATION] That's a real fear that comes from real experiences. The fact that you're here, even with that history, shows courage. I'm not here to fix you or push you—I'm here to be a consistent, safe space. You set the pace. Is there something small you'd like to explore today, or would you prefer we just... be here together for a moment?", interventionType: 'VALIDATION' },
    { role: 'user', content: 'Can we do a breathing exercise? That felt safe last time.', interventionType: null },
    { role: 'assistant', content: "[GROUNDING] Of course. Let's do box breathing together—it's structured and predictable, which might feel good right now. We'll breathe in for 4 counts, hold for 4, out for 4, hold for 4. Ready when you are.\n\nIn... 2... 3... 4...\nHold... 2... 3... 4...\nOut... 2... 3... 4...\nHold... 2... 3... 4...\n\nHow does that feel? We can do a few more rounds if you'd like.", interventionType: 'GROUNDING' },
  ];

  for (let i = 0; i < marcusAITwinMessages.length; i++) {
    await prisma.aITwinMessage.create({
      data: {
        chatId: marcusAITwinChat.id,
        role: marcusAITwinMessages[i].role,
        contentEnc: mockEncrypt(marcusAITwinMessages[i].content),
        interventionType: marcusAITwinMessages[i].interventionType,
        createdAt: hoursAgo(24 - i * 3),
      },
    });
  }

  // Aisha (TRANSFORMER) - AI Twin helping with grief processing
  const aishaAITwinChat = await prisma.aITwinChat.create({
    data: {
      userId: aisha.id,
      briefSummary: JSON.stringify({
        summary: "Transformer archetype in active recovery from major life transition (divorce). Shows remarkable resilience trajectory with PHQ-9 dropping from 15 to 3 over 60 days. Strong engagement with platform rituals.",
        presentingConcerns: ["Identity reconstruction", "Processing grief", "Building new life vision"],
        riskAssessment: { level: "low", score: 15, factors: ["Strong support system", "High engagement", "Positive trajectory"] },
        emotionalPatterns: { dominantEmotions: ["determination", "hope", "occasional grief"], moodTrajectory: "Strong upward trend", sentimentTrend: "improving" },
        recommendedApproach: ["Celebrate growth", "Support identity exploration", "Validate both grief and joy"],
      }),
      isActive: true,
    },
  });

  const aishaAITwinMessages = [
    { role: 'user', content: 'I woke up feeling happy today and immediately felt guilty. Like I\'m betraying my old life.', interventionType: null },
    { role: 'assistant', content: "[REFRAME] That guilt is so common after loss, Aisha—it's almost like our hearts need permission to feel joy again. But here's another way to look at it: happiness isn't betrayal. It's evidence of your capacity to heal, to grow, to carry both the grief and the joy. You're not leaving your old life behind—you're integrating it into a larger story.", interventionType: 'REFRAME' },
    { role: 'user', content: 'A larger story. I like that. It doesn\'t have to be either/or.', interventionType: null },
    { role: 'assistant', content: "[VALIDATION] Exactly. Your past shaped you, your present is creating you, and your future is waiting for you. You can honor what was while also embracing what is and what could be. That's not betrayal—that's being fully human. What did it feel like when you first noticed the happiness this morning?", interventionType: 'VALIDATION' },
    { role: 'user', content: 'Light. Like sunshine breaking through clouds. I had forgotten what that felt like.', interventionType: null },
    { role: 'assistant', content: "[PSYCHOEDUCATION] That description is beautiful—and it's also neurobiologically accurate. Prolonged grief and stress can dim our capacity to feel positive emotions, like clouds blocking the sun. The fact that you're feeling that lightness again means your nervous system is regulating, your brain is healing. You're not just recovering, Aisha—you're transforming. That's your archetype showing up in real time.", interventionType: 'PSYCHOEDUCATION' },
  ];

  for (let i = 0; i < aishaAITwinMessages.length; i++) {
    await prisma.aITwinMessage.create({
      data: {
        chatId: aishaAITwinChat.id,
        role: aishaAITwinMessages[i].role,
        contentEnc: mockEncrypt(aishaAITwinMessages[i].content),
        interventionType: aishaAITwinMessages[i].interventionType,
        createdAt: hoursAgo(12 - i * 2),
      },
    });
  }

  // Create escalation scenario - Maya had a crisis, AI Twin provided support, then handed off to therapist
  const mayaEscalation = await prisma.escalation.create({
    data: {
      userId: maya.id,
      trigger: 'KEYWORD_DETECTED',
      status: 'THERAPIST_ASSIGNED',
      riskScore: 65,
      triggerData: {
        keywords: ['no reason to live'],
        source: 'ai_twin_chat',
        context: 'User expressed hopelessness during late-night session',
      },
      aiTwinBriefEnc: mockEncrypt(JSON.stringify({
        summary: "Drifter archetype experiencing acute disconnection episode. PHQ-9 trend had been improving but spike detected. Keywords flagged during AI Twin conversation.",
        presentingConcerns: ["Acute loneliness", "Existential questioning", "Disconnection from purpose"],
        riskAssessment: { level: "moderate", score: 65, factors: ["Keyword detection", "Late-night session", "Previous improvement makes spike notable"] },
        emotionalPatterns: { dominantEmotions: ["loneliness", "confusion", "underlying hope"], moodTrajectory: "Stable with acute spike", sentimentTrend: "fluctuating" },
        recommendedApproach: ["Validate feelings without reinforcing hopelessness", "Explore connection needs", "Gentle reality testing"],
        aiTwinSummary: "AI Twin provided crisis support and grounding. User engaged with breathing exercise and agreed to human therapist connection. No immediate safety concerns but follow-up recommended.",
      })),
      therapistId: (await prisma.therapistProfile.findFirst())?.id,
      createdAt: daysAgo(5),
    },
  });

  // Create AI Twin chat for Maya's escalation
  const mayaAITwinChat = await prisma.aITwinChat.create({
    data: {
      userId: maya.id,
      escalationId: mayaEscalation.id,
      briefSummary: JSON.stringify({
        summary: "Drifter archetype in acute episode. Keywords detected but context suggests existential questioning rather than active crisis.",
      }),
      isActive: false,
      handoffRequested: true,
      createdAt: daysAgo(5),
    },
  });

  const mayaAITwinMessages = [
    { role: 'user', content: 'I feel like there\'s no reason to live like this anymore. Floating through life without ever landing.', interventionType: null, riskFlagged: true },
    { role: 'assistant', content: "[CRISIS_SUPPORT] Maya, I hear a lot of pain in what you're saying. That feeling of floating without landing—it sounds exhausting. I want to make sure I understand: are you thinking about hurting yourself, or are you describing how disconnected and purposeless things feel right now?", interventionType: 'CRISIS_SUPPORT', riskFlagged: false },
    { role: 'user', content: 'No, I don\'t want to hurt myself. I just... I\'m tired of feeling like a ghost in my own life.', interventionType: null, riskFlagged: false },
    { role: 'assistant', content: "[VALIDATION] Thank you for clarifying that, and I'm glad you're safe. What you're describing—feeling like a ghost, passing through without touching anything—that's real and valid pain. And you reached out, which means part of you wants to land somewhere. Can we do a grounding exercise together right now? Sometimes when we're floating, we need to feel our feet on the ground first.", interventionType: 'GROUNDING', riskFlagged: false },
    { role: 'user', content: 'Okay. Yes. I need something to anchor to.', interventionType: null, riskFlagged: false },
    { role: 'assistant', content: "[GROUNDING] Feel your feet on the floor. Press them down. Notice the temperature, the texture beneath you. Now, name 5 things you can see around you right now. Just observe them, no judgment.\n\n...\n\nGood. You're here, Maya. In this moment, you're not floating—you're present. When you're ready, I want to offer you something: would you like to connect with a human therapist who can explore these feelings of disconnection with you? Not because I can't help, but because you deserve that human anchor too.", interventionType: 'GROUNDING', riskFlagged: false },
    { role: 'user', content: 'Yes. I think I\'d like that.', interventionType: null, riskFlagged: false },
    { role: 'assistant', content: "[VALIDATION] That's a brave choice, Maya. I've connected you with Dr. Rodriguez, who specializes in helping people find their grounding. She'll reach out within 24 hours. In the meantime, I'm here whenever you need me. You're not alone—even when you feel like a ghost, I see you. And now, a human will see you too.", interventionType: 'VALIDATION', riskFlagged: false },
  ];

  for (let i = 0; i < mayaAITwinMessages.length; i++) {
    await prisma.aITwinMessage.create({
      data: {
        chatId: mayaAITwinChat.id,
        role: mayaAITwinMessages[i].role,
        contentEnc: mockEncrypt(mayaAITwinMessages[i].content),
        interventionType: mayaAITwinMessages[i].interventionType,
        riskFlagged: mayaAITwinMessages[i].riskFlagged || false,
        createdAt: daysAgo(5),
      },
    });
  }

  // Log escalation events
  await prisma.escalationLog.createMany({
    data: [
      { escalationId: mayaEscalation.id, action: 'ESCALATION_CREATED', details: { trigger: 'KEYWORD_DETECTED', source: 'ai_twin' }, actorId: maya.id, createdAt: daysAgo(5) },
      { escalationId: mayaEscalation.id, action: 'AI_TWIN_INTERVENTION', details: { interventions: ['crisis_support', 'grounding'], duration: '15 minutes' }, createdAt: daysAgo(5) },
      { escalationId: mayaEscalation.id, action: 'AI_TWIN_HANDOFF_REQUESTED', details: { reason: 'User agreed to human therapist connection' }, actorId: maya.id, createdAt: daysAgo(5) },
      { escalationId: mayaEscalation.id, action: 'THERAPIST_ASSIGNED', details: { therapistName: 'Dr. Elena Rodriguez' }, createdAt: daysAgo(5) },
    ],
  });

  console.log('   ✅ AI Twin conversations created');
  console.log('   ✅ Escalation scenario with AI Twin → Therapist handoff created');

  // ═══════════════════════════════════════════════════════════════════
  // NOTIFICATIONS FOR DEMO
  // ═══════════════════════════════════════════════════════════════════
  const notifications = [
    { userId: maya.id, type: 'BADGE_EARNED' as const, title: 'New Badge!', body: 'You earned the Breath Master badge for your 7-day streak!', data: { badge: 'breath-streak-7' } },
    { userId: james.id, type: 'RITUAL_REMINDER' as const, title: 'Evening Check-in', body: 'Take a moment to reflect on your day.', data: { action: 'mood-mirror' } },
    { userId: aisha.id, type: 'BADGE_EARNED' as const, title: 'Milestone Reached!', body: 'You\'ve been on a 100-day streak! Your consistency is inspiring.', data: { badge: 'streak-100' } },
    { userId: marcus.id, type: 'MOOD_CHECKIN' as const, title: 'How are you feeling?', body: 'It\'s been a few days since your last check-in. No pressure—just here when you\'re ready.', data: {} },
    { userId: patricia.id, type: 'COMMUNITY_UPDATE' as const, title: 'Community Impact', body: 'Your post in Veterans Hall received 12 supportive responses.', data: { community: 'veterans-hall' } },
  ];

  for (const notif of notifications) {
    await prisma.notification.create({ data: notif });
  }

  console.log('\n✅ Created notifications');

  // ═══════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(60));
  console.log('🎉 SEEDING COMPLETE!');
  console.log('═'.repeat(60));
  console.log('\n📋 DEMO ACCOUNTS (all passwords: demo123):');
  console.log('─'.repeat(60));
  console.log('👑 Admin:      admin@cerebro.app');
  console.log('👔 HR:         hr@techflow.io');
  console.log('🩺 Therapist:  therapist@cerebro.app');
  console.log('─'.repeat(60));
  console.log('🌊 DRIFTER:    maya@demo.cerebro.app');
  console.log('🧠 THINKER:    james@demo.cerebro.app');
  console.log('🦋 TRANSFORMER: aisha@demo.cerebro.app');
  console.log('🔍 SEEKER:     marcus@demo.cerebro.app');
  console.log('⚔️ VETERAN:    patricia@demo.cerebro.app');
  console.log('─'.repeat(60));
  console.log('\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
