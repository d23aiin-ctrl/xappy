// ACE (Adverse Childhood Experiences) Questionnaire Scoring
// 10 questions, each scored 0 or 1, total 0-10

export interface ACEQuestion {
  id: number;
  text: string;
  narrativeFrame: string;
  category: 'abuse' | 'neglect' | 'household';
}

export const ACE_QUESTIONS: ACEQuestion[] = [
  {
    id: 1,
    text: 'Did a parent or other adult in the household often swear at you, insult you, put you down, or humiliate you?',
    narrativeFrame: 'The shadows whisper of words that cut deeper than any blade...',
    category: 'abuse',
  },
  {
    id: 2,
    text: 'Did a parent or other adult in the household often push, grab, slap, or throw something at you?',
    narrativeFrame: 'Sometimes touch carries pain instead of comfort...',
    category: 'abuse',
  },
  {
    id: 3,
    text: 'Did an adult or person at least 5 years older than you ever touch or fondle you in a sexual way?',
    narrativeFrame: 'Some boundaries should never have been crossed...',
    category: 'abuse',
  },
  {
    id: 4,
    text: 'Did you often feel that no one in your family loved you or thought you were important or special?',
    narrativeFrame: 'In the echoes of childhood, did you hear your worth reflected back?',
    category: 'neglect',
  },
  {
    id: 5,
    text: 'Did you often feel that you didn\'t have enough to eat, had to wear dirty clothes, or had no one to protect you?',
    narrativeFrame: 'The foundations of safety—were they sturdy or crumbling?',
    category: 'neglect',
  },
  {
    id: 6,
    text: 'Were your parents ever separated or divorced?',
    narrativeFrame: 'The family constellation—did stars drift apart?',
    category: 'household',
  },
  {
    id: 7,
    text: 'Was your mother or stepmother often pushed, grabbed, slapped, or had something thrown at her?',
    narrativeFrame: 'What storms did you witness from your small shelter?',
    category: 'household',
  },
  {
    id: 8,
    text: 'Did you live with anyone who was a problem drinker or alcoholic or who used street drugs?',
    narrativeFrame: 'Were there demons in bottles or powders that haunted your home?',
    category: 'household',
  },
  {
    id: 9,
    text: 'Was a household member depressed or mentally ill, or did a household member attempt suicide?',
    narrativeFrame: 'The weight of another\'s darkness—did it press upon your small shoulders?',
    category: 'household',
  },
  {
    id: 10,
    text: 'Did a household member go to prison?',
    narrativeFrame: 'Did absence carve hollows where presence should have been?',
    category: 'household',
  },
];

export interface ACEResult {
  totalScore: number;
  categoryScores: {
    abuse: number;
    neglect: number;
    household: number;
  };
  riskLevel: 'low' | 'moderate' | 'high' | 'severe';
  interpretation: string;
}

export function scoreACE(responses: Record<number, boolean>): ACEResult {
  let total = 0;
  const categories = { abuse: 0, neglect: 0, household: 0 };

  ACE_QUESTIONS.forEach((q) => {
    if (responses[q.id]) {
      total++;
      categories[q.category]++;
    }
  });

  let riskLevel: ACEResult['riskLevel'];
  let interpretation: string;

  if (total === 0) {
    riskLevel = 'low';
    interpretation = 'Your early environment appears to have been relatively stable and nurturing.';
  } else if (total <= 3) {
    riskLevel = 'moderate';
    interpretation = 'You experienced some adversity in childhood. These experiences may have shaped your coping patterns.';
  } else if (total <= 6) {
    riskLevel = 'high';
    interpretation = 'You experienced significant childhood adversity. Your resilience in reaching this point shows strength.';
  } else {
    riskLevel = 'severe';
    interpretation = 'You have walked through considerable darkness. Your presence here speaks to profound inner strength.';
  }

  return {
    totalScore: total,
    categoryScores: categories,
    riskLevel,
    interpretation,
  };
}
