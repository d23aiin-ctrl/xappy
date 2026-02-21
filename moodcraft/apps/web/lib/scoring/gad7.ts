// GAD-7 (Generalized Anxiety Disorder-7) Scoring
// Screens for anxiety severity
// Each question scored 0-3, total 0-21

export interface GAD7Question {
  id: number;
  clinicalText: string;
  narrativeText: string;
}

export const GAD7_QUESTIONS: GAD7Question[] = [
  {
    id: 1,
    clinicalText: 'Feeling nervous, anxious, or on edge',
    narrativeText: 'Does your inner sentinel stand watch constantly, alert to every sound in the night?',
  },
  {
    id: 2,
    clinicalText: 'Not being able to stop or control worrying',
    narrativeText: 'Do worries circle like ravens, refusing to let your mind rest?',
  },
  {
    id: 3,
    clinicalText: 'Worrying too much about different things',
    narrativeText: 'Does concern spread like water, finding every crack and crevice?',
  },
  {
    id: 4,
    clinicalText: 'Trouble relaxing',
    narrativeText: 'When you seek stillness, does your body remember how to rest?',
  },
  {
    id: 5,
    clinicalText: 'Being so restless that it\'s hard to sit still',
    narrativeText: 'Does restlessness hum through you like an ungrounded current?',
  },
  {
    id: 6,
    clinicalText: 'Becoming easily annoyed or irritable',
    narrativeText: 'Is your patience worn thin, like fabric stretched too tight?',
  },
  {
    id: 7,
    clinicalText: 'Feeling afraid as if something awful might happen',
    narrativeText: 'Does dread lurk at the edges, whispering of disasters yet to come?',
  },
];

export const GAD7_RESPONSE_OPTIONS = [
  { value: 0, label: 'Not at all', narrativeLabel: 'Peace prevails' },
  { value: 1, label: 'Several days', narrativeLabel: 'Ripples disturb the surface' },
  { value: 2, label: 'More than half the days', narrativeLabel: 'Waves grow stronger' },
  { value: 3, label: 'Nearly every day', narrativeLabel: 'The storm rages on' },
];

export interface GAD7Result {
  totalScore: number;
  severity: 'minimal' | 'mild' | 'moderate' | 'severe';
  interpretation: string;
  requiresAttention: boolean;
}

export function scoreGAD7(responses: Record<number, number>): GAD7Result {
  let total = 0;
  for (let i = 1; i <= 7; i++) {
    total += responses[i] || 0;
  }

  let severity: GAD7Result['severity'];
  let interpretation: string;
  let requiresAttention = false;

  if (total <= 4) {
    severity = 'minimal';
    interpretation = 'Your inner waters are relatively calm. Continue practices that maintain this peace.';
  } else if (total <= 9) {
    severity = 'mild';
    interpretation = 'Some currents of worry flow beneath the surface. Mindfulness may help smooth the waters.';
  } else if (total <= 14) {
    severity = 'moderate';
    interpretation = 'Anxiety has taken root. Consider reaching out for support to find calmer shores.';
    requiresAttention = true;
  } else {
    severity = 'severe';
    interpretation = 'You are weathering a significant storm. Professional guidance can help you navigate these waters.';
    requiresAttention = true;
  }

  return {
    totalScore: total,
    severity,
    interpretation,
    requiresAttention,
  };
}
