'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { getArchetypeLabel, getArchetypeColor } from '@/lib/scoring/archetype';
import type { Archetype } from '@prisma/client';

interface ArchetypeData {
  archetype: Archetype;
  description: string;
  companionTone: string;
  confidence: number;
}

export default function ArchetypeRevealPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [data, setData] = useState<ArchetypeData | null>(null);

  useEffect(() => {
    async function fetchArchetype() {
      try {
        const res = await fetch('/api/onboarding/archetype');
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch archetype:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchArchetype();
  }, []);

  async function handleContinue() {
    await fetch('/api/onboarding/complete', { method: 'POST' });
    router.push('/dashboard');
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-midnight flex items-center justify-center">
        <div className="text-center">
          <div className="oracle-spinner mx-auto mb-4" />
          <p className="text-muted-foreground">The Oracle is reading your path...</p>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-gradient-midnight flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Something went wrong.</p>
          <Button onClick={() => router.push('/onboarding')}>Start Over</Button>
        </div>
      </main>
    );
  }

  const archetypeLabel = getArchetypeLabel(data.archetype);
  const archetypeColor = getArchetypeColor(data.archetype);

  return (
    <main className="min-h-screen bg-gradient-midnight relative overflow-hidden">
      {/* Background glow */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: revealed ? 1 : 0 }}
        transition={{ duration: 2 }}
      >
        <div
          className="w-[600px] h-[600px] rounded-full blur-[150px] opacity-30"
          style={{ backgroundColor: archetypeColor }}
        />
      </motion.div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.div
              key="pre-reveal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center max-w-lg"
            >
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-6 text-gradient-oracle">
                The Oracle Has Spoken
              </h1>
              <p className="text-muted-foreground mb-8">
                Your journey through the fog has revealed patterns in your soul.
                The labyrinth recognizes who you are.
              </p>
              <Button
                variant="oracle"
                size="xl"
                onClick={() => setRevealed(true)}
                className="animate-oracle-pulse"
              >
                Reveal My Archetype
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="revealed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-center max-w-lg"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-sm text-muted-foreground mb-2">You are</p>
                <h1
                  className="font-display text-5xl md:text-6xl font-bold mb-6"
                  style={{ color: archetypeColor }}
                >
                  {archetypeLabel}
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-lg text-muted-foreground mb-8 leading-relaxed"
              >
                {data.description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="glass-card p-4 mb-8"
              >
                <p className="text-sm text-oracle-400">
                  <span className="font-semibold">Your AI Companion will be:</span>
                </p>
                <p className="text-muted-foreground text-sm mt-1">{data.companionTone}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                <Button variant="veil" size="lg" onClick={handleContinue}>
                  Begin Your Journey
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
