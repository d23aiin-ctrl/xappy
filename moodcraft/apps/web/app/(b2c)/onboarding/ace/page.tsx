'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ACE_QUESTIONS } from '@/lib/scoring/ace';

export default function ACEQuestionnairePage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, boolean>>({});
  const [startTime] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);

  const currentQuestion = ACE_QUESTIONS[currentIndex];
  const progress = ((currentIndex) / ACE_QUESTIONS.length) * 100;
  const isLastQuestion = currentIndex === ACE_QUESTIONS.length - 1;

  async function handleResponse(answer: boolean) {
    const newResponses = { ...responses, [currentQuestion.id]: answer };
    setResponses(newResponses);

    if (isLastQuestion) {
      setSubmitting(true);
      const timeTaken = Date.now() - startTime;

      try {
        await fetch('/api/onboarding/ace', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ responses: newResponses, timeTakenMs: timeTaken }),
        });
        router.push('/onboarding/mood-calibration');
      } catch (error) {
        console.error('Failed to save ACE responses:', error);
        setSubmitting(false);
      }
    } else {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 300);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-midnight flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-midnight-950/80 backdrop-blur-sm">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>ACE Assessment</span>
            <span>{currentIndex + 1} of {ACE_QUESTIONS.length}</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center px-4 pt-20 pb-8">
        <AnimatePresence mode="wait">
          {!submitting ? (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="max-w-lg w-full"
            >
              <p className="text-oracle-400/70 text-sm mb-4 font-display italic">
                {currentQuestion.narrativeFrame}
              </p>
              <h2 className="text-xl md:text-2xl font-medium mb-8 leading-relaxed">
                {currentQuestion.text}
              </h2>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 h-16 text-lg border-white/10 hover:bg-white/5 hover:border-green-500/50"
                  onClick={() => handleResponse(false)}
                >
                  No
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 h-16 text-lg border-white/10 hover:bg-white/5 hover:border-red-500/50"
                  onClick={() => handleResponse(true)}
                >
                  Yes
                </Button>
              </div>

              <p className="text-xs text-muted-foreground/50 text-center mt-8">
                Your responses are encrypted and will never be shared without your explicit consent.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="submitting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="oracle-spinner mx-auto mb-4" />
              <p className="text-muted-foreground">Processing your journey...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
