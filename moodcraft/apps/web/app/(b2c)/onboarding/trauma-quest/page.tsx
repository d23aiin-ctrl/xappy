'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronRight, ChevronLeft, Shield, Heart, Eye, Flame, Feather } from 'lucide-react';

interface QuestPrompt {
  id: number;
  title: string;
  narrative: string;
  prompt: string;
  icon: typeof Shield;
  gradient: string;
  category: 'safety' | 'connection' | 'identity' | 'resilience' | 'vision';
}

const QUEST_PROMPTS: QuestPrompt[] = [
  {
    id: 1,
    title: 'The Shelter',
    narrative:
      'Imagine a place where you feel completely safe. It can be real or imagined -- a room, a landscape, a memory. The Oracle invites you to step into this space.',
    prompt:
      'Describe your safe place. What do you see, hear, and feel there? Who, if anyone, is with you?',
    icon: Shield,
    gradient: 'from-cyan-600/20 to-blue-600/20',
    category: 'safety',
  },
  {
    id: 2,
    title: 'The Mirror',
    narrative:
      'You stand before a mirror that shows not your face, but your inner world. The reflection shifts and swirls, revealing something about who you truly are beneath the surface.',
    prompt:
      'What does the mirror show you? What part of yourself do you rarely let others see?',
    icon: Eye,
    gradient: 'from-purple-600/20 to-veil-600/20',
    category: 'identity',
  },
  {
    id: 3,
    title: 'The Bridge',
    narrative:
      'Before you is a bridge spanning a deep chasm. On the other side stands someone important -- someone you\'ve lost, or a version of yourself you\'ve left behind. The bridge is safe to cross.',
    prompt:
      'Who or what is on the other side? What would you say to them if you could? What do you need them to know?',
    icon: Heart,
    gradient: 'from-rose-600/20 to-pink-600/20',
    category: 'connection',
  },
  {
    id: 4,
    title: 'The Forge',
    narrative:
      'You find yourself in a warm forge -- a place where broken things are remade into something new. The fire is not destructive here. It transforms. You hold something that represents your pain.',
    prompt:
      'What are you holding? What shape does your pain take? If the forge could transform it, what would it become?',
    icon: Flame,
    gradient: 'from-amber-600/20 to-orange-600/20',
    category: 'resilience',
  },
  {
    id: 5,
    title: 'The Horizon',
    narrative:
      'Dawn is breaking. You stand at the edge of a vast landscape that stretches into the future. There are no roads yet -- only open ground. You get to choose your direction.',
    prompt:
      'What does your ideal tomorrow look like? What is one thing you want to leave behind, and one thing you want to carry forward?',
    icon: Feather,
    gradient: 'from-emerald-600/20 to-teal-600/20',
    category: 'vision',
  },
];

export default function TraumaQuestPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [direction, setDirection] = useState(1);

  const currentPrompt = QUEST_PROMPTS[currentStep];
  const Icon = currentPrompt.icon;
  const progress = ((currentStep + 1) / QUEST_PROMPTS.length) * 100;

  const handleResponse = useCallback(
    (value: string) => {
      setResponses((prev) => ({ ...prev, [currentPrompt.id]: value }));
    },
    [currentPrompt.id]
  );

  const goNext = useCallback(() => {
    if (currentStep < QUEST_PROMPTS.length - 1) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep]);

  const goPrev = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleComplete = useCallback(async () => {
    setSubmitting(true);
    try {
      await fetch('/api/onboarding/trauma-quest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: QUEST_PROMPTS.map((p) => ({
            promptId: p.id,
            category: p.category,
            response: responses[p.id] || '',
          })),
        }),
      });
      router.push('/onboarding/mood-calibration');
    } catch (error) {
      console.error('Failed to save trauma quest:', error);
    } finally {
      setSubmitting(false);
    }
  }, [responses, router]);

  const canProceed = (responses[currentPrompt.id] || '').trim().length > 10;
  const isLastStep = currentStep === QUEST_PROMPTS.length - 1;

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <main className="min-h-screen bg-[#0a0a12] relative overflow-hidden flex items-center justify-center">
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-veil-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/3 rounded-full blur-3xl" />
      </div>

      {/* Floating particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-veil-400/30 rounded-full"
          style={{
            left: `${10 + i * 12}%`,
            top: `${20 + (i * 7) % 60}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}

      <div className="relative z-10 w-full max-w-2xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-sm font-medium text-veil-400 tracking-widest uppercase mb-2">
            The Trauma Quest
          </h1>
          <p className="text-gray-500 text-sm">
            Five guided stories. There are no wrong answers -- only your truth.
          </p>
        </motion.div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">
              Story {currentStep + 1} of {QUEST_PROMPTS.length}
            </span>
            <span className="text-xs text-gray-500">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-veil-600 to-veil-400 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-3 mt-4">
            {QUEST_PROMPTS.map((p, i) => {
              const StepIcon = p.icon;
              const isActive = i === currentStep;
              const isCompleted = (responses[p.id] || '').trim().length > 10;
              return (
                <motion.button
                  key={p.id}
                  onClick={() => {
                    setDirection(i > currentStep ? 1 : -1);
                    setCurrentStep(i);
                  }}
                  className={`p-2 rounded-full transition-all ${
                    isActive
                      ? 'bg-veil-500/30 text-veil-300 scale-110'
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-white/5 text-gray-600'
                  }`}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <StepIcon className="w-4 h-4" />
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Quest Card */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentPrompt.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <div
              className={`rounded-2xl border border-white/10 bg-gradient-to-br ${currentPrompt.gradient} p-8 relative overflow-hidden`}
            >
              {/* Ambient glow */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/3 rounded-full blur-3xl" />
              </div>

              <div className="relative z-10">
                {/* Title & Icon */}
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="p-3 rounded-xl bg-white/10 backdrop-blur-sm"
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {currentPrompt.title}
                    </h2>
                    <span className="text-xs text-gray-400 capitalize">
                      {currentPrompt.category}
                    </span>
                  </div>
                </div>

                {/* Narrative */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-300 leading-relaxed mb-6 text-sm"
                >
                  {currentPrompt.narrative}
                </motion.p>

                {/* Prompt */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10"
                >
                  <p className="text-white font-medium text-sm italic">
                    "{currentPrompt.prompt}"
                  </p>
                </motion.div>

                {/* Response Area */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Textarea
                    value={responses[currentPrompt.id] || ''}
                    onChange={(e) => handleResponse(e.target.value)}
                    placeholder="Write your response here... take your time."
                    className="min-h-[150px] bg-white/5 border-white/10 text-white placeholder:text-gray-600 resize-none focus:border-veil-500/50"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-600">
                      {(responses[currentPrompt.id] || '').split(/\s+/).filter(Boolean).length} words
                    </span>
                    <span className="text-xs text-gray-600">
                      {canProceed ? 'Ready to continue' : 'Write at least a few words'}
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-between mt-6"
        >
          <Button
            variant="ghost"
            onClick={goPrev}
            disabled={currentStep === 0}
            className="text-gray-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center gap-3">
            {!isLastStep && (
              <Button
                variant="ghost"
                onClick={goNext}
                className="text-gray-500 hover:text-gray-300 text-sm"
              >
                Skip
              </Button>
            )}

            {isLastStep ? (
              <Button
                onClick={handleComplete}
                disabled={submitting}
                className="bg-gradient-to-r from-veil-600 to-veil-500 hover:from-veil-500 hover:to-veil-400 text-white px-8"
              >
                {submitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  'Complete Quest'
                )}
              </Button>
            ) : (
              <Button
                onClick={goNext}
                disabled={!canProceed}
                className="bg-gradient-to-r from-veil-600 to-veil-500 hover:from-veil-500 hover:to-veil-400 text-white px-6"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </motion.div>

        {/* Safety notice */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-xs text-gray-600 mt-8"
        >
          Your responses are encrypted and private. You can skip any prompt that feels uncomfortable.
        </motion.p>
      </div>
    </main>
  );
}
