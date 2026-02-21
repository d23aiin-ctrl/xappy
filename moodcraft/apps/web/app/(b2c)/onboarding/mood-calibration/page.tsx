'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const EMOTIONS = [
  { emoji: '😊', label: 'Joy', color: 'bg-yellow-500/20 border-yellow-500/50' },
  { emoji: '😢', label: 'Sadness', color: 'bg-blue-500/20 border-blue-500/50' },
  { emoji: '😰', label: 'Anxiety', color: 'bg-purple-500/20 border-purple-500/50' },
  { emoji: '😤', label: 'Anger', color: 'bg-red-500/20 border-red-500/50' },
  { emoji: '😨', label: 'Fear', color: 'bg-gray-500/20 border-gray-500/50' },
  { emoji: '🤔', label: 'Confusion', color: 'bg-orange-500/20 border-orange-500/50' },
  { emoji: '😌', label: 'Peace', color: 'bg-green-500/20 border-green-500/50' },
  { emoji: '💪', label: 'Strength', color: 'bg-amber-500/20 border-amber-500/50' },
];

export default function MoodCalibrationPage() {
  const router = useRouter();
  const [step, setStep] = useState<'emotions' | 'baseline' | 'volatility'>('emotions');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [baseline, setBaseline] = useState(5);
  const [volatility, setVolatility] = useState(0.5);
  const [submitting, setSubmitting] = useState(false);

  function toggleEmotion(label: string) {
    if (selectedEmotions.includes(label)) {
      setSelectedEmotions(selectedEmotions.filter((e) => e !== label));
    } else if (selectedEmotions.length < 3) {
      setSelectedEmotions([...selectedEmotions, label]);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await fetch('/api/onboarding/mood-calibration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dominantEmotions: selectedEmotions,
          baseline,
          volatility,
        }),
      });
      router.push('/onboarding/archetype-reveal');
    } catch (error) {
      console.error('Failed to save mood calibration:', error);
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-midnight flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full"
      >
        {step === 'emotions' && (
          <>
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-2 text-center">
              Mood Calibration
            </h1>
            <p className="text-muted-foreground text-center mb-8">
              Which emotions visit you most often? Select up to 3.
            </p>

            <div className="grid grid-cols-4 gap-3 mb-8">
              {EMOTIONS.map((emotion) => (
                <button
                  key={emotion.label}
                  onClick={() => toggleEmotion(emotion.label)}
                  className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                    selectedEmotions.includes(emotion.label)
                      ? emotion.color + ' scale-105'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="text-2xl mb-1">{emotion.emoji}</span>
                  <span className="text-xs text-muted-foreground">{emotion.label}</span>
                </button>
              ))}
            </div>

            <Button
              variant="veil"
              className="w-full"
              disabled={selectedEmotions.length === 0}
              onClick={() => setStep('baseline')}
            >
              Continue
            </Button>
          </>
        )}

        {step === 'baseline' && (
          <>
            <h2 className="font-display text-2xl font-bold mb-2 text-center">
              Your Baseline
            </h2>
            <p className="text-muted-foreground text-center mb-8">
              On most days, where does your emotional compass point?
            </p>

            <div className="mb-8">
              <input
                type="range"
                min="1"
                max="10"
                value={baseline}
                onChange={(e) => setBaseline(Number(e.target.value))}
                className="w-full accent-veil-500"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>Heavy</span>
                <span className="text-lg font-bold text-veil-400">{baseline}</span>
                <span>Light</span>
              </div>
            </div>

            <Button variant="veil" className="w-full" onClick={() => setStep('volatility')}>
              Continue
            </Button>
          </>
        )}

        {step === 'volatility' && (
          <>
            <h2 className="font-display text-2xl font-bold mb-2 text-center">
              Emotional Tides
            </h2>
            <p className="text-muted-foreground text-center mb-8">
              How much do your emotions shift throughout the day?
            </p>

            <div className="mb-8">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volatility}
                onChange={(e) => setVolatility(Number(e.target.value))}
                className="w-full accent-veil-500"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>Steady waters</span>
                <span>Shifting tides</span>
              </div>
            </div>

            <Button
              variant="veil"
              className="w-full"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? <span className="oracle-spinner inline-block w-5 h-5" /> : 'Complete Calibration'}
            </Button>
          </>
        )}
      </motion.div>
    </main>
  );
}
