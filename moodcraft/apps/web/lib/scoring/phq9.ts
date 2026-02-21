// PHQ-9 (Patient Health Questionnaire-9) Scoring
// Screens for depression severity
// Each question scored 0-3, total 0-27

export interface PHQ9Question {
  id: number;
  clinicalText: string;
  narrativeText: string;
}

export const PHQ9_QUESTIONS: PHQ9Question[] = [
  {
    id: 1,
    clinicalText: 'Little interest or pleasure in doing things',
    narrativeText: 'The things that once brought you joy—do they still spark that light within?',
  },
  {
    id: 2,
    clinicalText: 'Feeling down, depressed, or hopeless',
    narrativeText: 'When you look ahead, does the path seem shrouded in fog, or can you glimpse the horizon?',
  },
  {
    id: 3,
    clinicalText: 'Trouble falling or staying asleep, or sleeping too much',
    narrativeText: 'Does rest come easily, or does it elude you like a shadow at twilight?',
  },
  {
    id: 4,
    clinicalText: 'Feeling tired or having little energy',
    narrativeText: 'Your inner flame—does it burn bright, or flicker low these days?',
  },
  {
    id: 5,
    clinicalText: 'Poor appetite or overeating',
    narrativeText: 'Nourishment of body—is it a comfort or a struggle?',
  },
  {
    id: 6,
    clinicalText: 'Feeling bad about yourself or that you are a failure',
    narrativeText: 'When the mirror reflects your soul, what story does it tell?',
  },
  {
    id: 7,
    clinicalText: 'Trouble concentrating on things',
    narrativeText: 'Your thoughts—do they flow like a clear stream, or scatter like leaves in wind?',
  },
  {
    id: 8,
    clinicalText: 'Moving or speaking slowly, or being fidgety/restless',
    narrativeText: 'Your body\'s rhythm—steady as the tide, or choppy like storm waves?',
  },
  {
    id: 9,
    clinicalText: 'Thoughts of self-harm or that you would be better off dead',
    narrativeText: 'In your darkest moments, do thoughts of ending the journey ever whisper to you?',
  },
];

export const PHQ9_RESPONSE_OPTIONS = [
  { value: 0, label: 'Not at all', narrativeLabel: 'The sun still shines' },
  { value: 1, label: 'Several days', narrativeLabel: 'Clouds gather sometimes' },
  { value: 2, label: 'More than half the days', narrativeLabel: 'The sky grows heavy' },
  { value: 3, label: 'Nearly every day', narrativeLabel: 'The storm persists' },
];

export interface PHQ9Result {
  totalScore: number;
  severity: 'none' | 'minimal' | 'mild' | 'moderate' | 'moderately_severe' | 'severe';
  interpretation: string;
  requiresAttention: boolean;
  question9Flagged: boolean;
}

export function scorePHQ9(responses: Record<number, number>): PHQ9Result {
  let total = 0;
  for (let i = 1; i <= 9; i++) {
    total += responses[i] || 0;
  }

  const question9Flagged = (responses[9] || 0) >= 1;

  let severity: PHQ9Result['severity'];
  let interpretation: string;
  let requiresAttention = false;

  if (total <= 4) {
    severity = 'minimal';
    interpretation = 'Your inner weather appears calm. Continue nurturing your wellbeing.';
  } else if (total <= 9) {
    severity = 'mild';
    interpretation = 'Some clouds have gathered. Gentle self-care practices may help clear the sky.';
  } else if (total <= 14) {
    severity = 'moderate';
    interpretation = 'The weight you carry is noticeable. Consider speaking with someone who can help lighten the load.';
    requiresAttention = true;
  } else if (total <= 19) {
    severity = 'moderately_severe';
    interpretation = 'You are walking through a heavy storm. Professional support could be a guiding light.';
    requiresAttention = true;
  } else {
    severity = 'severe';
    interpretation = 'The darkness feels overwhelming. Please reach out—help is available, and you deserve support.';
    requiresAttention = true;
  }

  if (question9Flagged) {
    requiresAttention = true;
  }

  return {
    totalScore: total,
    severity,
    interpretation,
    requiresAttention,
    question9Flagged,
  };
}
