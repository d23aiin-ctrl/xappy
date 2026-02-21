'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Button } from '@/components/ui/button';

// Particle component for fog effect
function FogParticle({ delay, duration, startX, startY }: { delay: number; duration: number; startX: number; startY: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-white/5 blur-xl"
      style={{
        width: Math.random() * 200 + 100,
        height: Math.random() * 200 + 100,
        left: `${startX}%`,
        top: `${startY}%`,
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: [0, 0.3, 0.1, 0.3, 0],
        scale: [0.5, 1.2, 1, 1.1, 0.8],
        x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50],
        y: [0, Math.random() * 50 - 25, Math.random() * 50],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

// Floating orb component
function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl ${className}`}
      animate={{
        y: [0, -30, 0, 30, 0],
        x: [0, 20, 0, -20, 0],
        scale: [1, 1.1, 1, 0.95, 1],
        opacity: [0.3, 0.5, 0.3, 0.4, 0.3],
      }}
      transition={{
        duration: 8 + Math.random() * 4,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

export default function OnboardingEntryPage() {
  const router = useRouter();
  const [entered, setEntered] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const fogControls = useAnimation();

  // Generate fog particles
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 10,
    startX: Math.random() * 100,
    startY: Math.random() * 100,
  }));

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleEnter = useCallback(async () => {
    setEntered(true);

    // Dramatic fog parting animation
    await fogControls.start({
      opacity: 0,
      scale: 1.5,
      transition: { duration: 2.5, ease: 'easeInOut' },
    });

    setTimeout(() => {
      router.push('/onboarding/ace');
    }, 500);
  }, [fogControls, router]);

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#0a0a12]">
      {/* Deep background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-veil-950/50 via-transparent to-transparent" />

      {/* Animated star field */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              delay: Math.random() * 2,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      {/* Fog layers with parallax */}
      <motion.div
        className="absolute inset-0"
        animate={fogControls}
      >
        {/* Particle fog system */}
        {particles.map((p) => (
          <FogParticle key={p.id} {...p} />
        ))}

        {/* Layered fog gradients */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-[#0a0a12] via-veil-950/60 to-transparent"
          animate={entered ? { opacity: 0, y: -100 } : { opacity: 1, y: 0 }}
          transition={{ duration: 2, ease: 'easeOut' }}
        />

        {/* Left fog bank */}
        <motion.div
          className="absolute -left-1/4 top-0 w-3/4 h-full"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.15) 0%, transparent 70%)',
          }}
          animate={entered ? { x: '-100%', opacity: 0 } : { x: 0, opacity: 1 }}
          transition={{ duration: 2.5, ease: 'easeInOut' }}
        />

        {/* Right fog bank */}
        <motion.div
          className="absolute -right-1/4 top-0 w-3/4 h-full"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, transparent 70%)',
          }}
          animate={entered ? { x: '100%', opacity: 0 } : { x: 0, opacity: 1 }}
          transition={{ duration: 2.5, ease: 'easeInOut' }}
        />

        {/* Floating orbs */}
        <FloatingOrb className="w-96 h-96 bg-veil-600/20 -top-20 -left-20" delay={0} />
        <FloatingOrb className="w-80 h-80 bg-oracle-600/15 top-1/3 -right-20" delay={1} />
        <FloatingOrb className="w-72 h-72 bg-veil-500/10 bottom-20 left-1/4" delay={2} />
        <FloatingOrb className="w-64 h-64 bg-indigo-600/10 top-1/4 right-1/3" delay={1.5} />

        {/* Central vortex glow */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, rgba(99,102,241,0.05) 40%, transparent 70%)',
          }}
          animate={entered ? { scale: 3, opacity: 0 } : { scale: [1, 1.1, 1], opacity: 1 }}
          transition={entered ? { duration: 2 } : { duration: 4, repeat: Infinity }}
        />
      </motion.div>

      {/* Vignette overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 0%, rgba(10,10,18,0.8) 100%)',
      }} />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <AnimatePresence mode="wait">
          {!entered ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={showContent ? { opacity: 1 } : { opacity: 0 }}
              exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
              transition={{ duration: 1 }}
              className="text-center max-w-2xl"
            >
              {/* Mystical symbol */}
              <motion.div
                className="w-24 h-24 mx-auto mb-8 relative"
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <linearGradient id="fogGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="45" fill="none" stroke="url(#fogGradient)" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="35" fill="none" stroke="url(#fogGradient)" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="25" fill="none" stroke="url(#fogGradient)" strokeWidth="0.5" />
                  <path d="M50 5 L50 95 M5 50 L95 50 M15 15 L85 85 M85 15 L15 85" stroke="url(#fogGradient)" strokeWidth="0.3" />
                </svg>
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-4 h-4 rounded-full bg-veil-400/50 blur-sm" />
                </motion.div>
              </motion.div>

              <motion.h1
                className="font-display text-5xl md:text-6xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="bg-gradient-to-r from-veil-300 via-veil-400 to-oracle-400 bg-clip-text text-transparent">
                  The Fog Tunnel
                </span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-xl text-gray-300 mb-4 leading-relaxed">
                  Before you lies a passage shrouded in mist.
                </p>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  To navigate the labyrinth of your mind, you must first understand where you have been.
                  The questions ahead are waypoints—answer with honesty, and the fog will part to reveal your path.
                </p>
              </motion.div>

              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex items-center justify-center gap-3 text-sm text-gray-500 mb-8">
                  <svg className="w-4 h-4 text-veil-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Your responses are encrypted and completely private</span>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    size="lg"
                    onClick={handleEnter}
                    className="relative px-12 py-6 text-lg font-medium bg-gradient-to-r from-veil-600 to-veil-500 hover:from-veil-500 hover:to-veil-400 border-0 rounded-xl overflow-hidden group"
                  >
                    <span className="relative z-10">Enter the Fog</span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-oracle-600/50 to-veil-600/50"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                  </Button>
                </motion.div>

                <p className="text-xs text-gray-600 mt-6">
                  This journey takes about 5-7 minutes
                </p>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="transition"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              {/* Portal opening animation */}
              <motion.div
                className="relative w-32 h-32 mx-auto mb-8"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-veil-400/30"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-2 rounded-full border border-oracle-400/40"
                  animate={{ scale: [1.2, 1, 1.2] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-4 rounded-full border border-veil-300/50"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-veil-400 to-oracle-400 blur-sm" />
                </motion.div>
              </motion.div>

              <motion.p
                className="text-xl font-display bg-gradient-to-r from-veil-300 to-oracle-300 bg-clip-text text-transparent"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                The mist begins to part...
              </motion.p>

              <motion.p
                className="text-sm text-gray-500 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                Preparing your journey
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
