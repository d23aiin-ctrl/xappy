'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';
import {
  Brain,
  Heart,
  Shield,
  Sparkles,
  MessageCircle,
  BarChart3,
  Users,
  Lock,
  ArrowRight,
  CheckCircle,
  Zap,
  Compass,
  Wind,
  BookOpen,
  Building2,
  Stethoscope,
  ChevronDown,
  Award,
  TrendingUp,
  Clock,
  Eye,
  Mic,
  PenTool,
  Target,
  Layers,
  Activity,
  Globe,
  FileText,
  UserCheck,
  AlertTriangle,
  Phone,
  Play,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const FEATURES = [
  {
    icon: Compass,
    title: 'MindMetro Journey',
    description: 'Navigate your mental wellness through an immersive subway-map visualization. Progress through Awareness, Acceptance, Integration, and Synthesis stations.',
    details: ['Visual progress tracking', 'Milestone celebrations', 'Personalized pathways'],
    color: 'from-veil-500 to-indigo-500',
  },
  {
    icon: Heart,
    title: 'Mood Mirror',
    description: 'Daily emotional check-ins with clinical-grade assessments (PHQ-9, GAD-7) disguised as gentle, narrative reflections.',
    details: ['Voice recording support', 'Sentiment analysis', 'Longitudinal tracking'],
    color: 'from-rose-500 to-pink-500',
  },
  {
    icon: BookOpen,
    title: 'Adaptive Journaling',
    description: 'AI-powered prompts that evolve with your emotional state. 50+ therapeutic prompts spanning shadow work, CBT, grief, and expressive writing.',
    details: ['Voice-to-text (Whisper)', 'Weekly Mirror Scroll summaries', 'Archetype-tailored prompts'],
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Wind,
    title: 'Breath Loops',
    description: 'Guided breathing rituals with mesmerizing fog-clearing animations. Box breathing, 4-7-8, and paced techniques.',
    details: ['Animated breath circles', 'Grounding actions', 'Session completion badges'],
    color: 'from-cyan-500 to-teal-500',
  },
  {
    icon: MessageCircle,
    title: 'AI Companion (Anima/Animus)',
    description: 'Your personal Jungian guide. An archetype-aware AI that remembers your journey and speaks in a voice that resonates with your soul.',
    details: ['5 archetype personalities', 'Context-aware responses', 'Real-time risk scanning'],
    color: 'from-purple-500 to-violet-500',
  },
  {
    icon: Shield,
    title: 'Crisis Escalation Engine',
    description: 'Intelligent risk detection with seamless multi-tier escalation. The Oracle Corridor ensures no one walks alone in darkness.',
    details: ['<30 second response', 'AI Twin case briefs', 'Human therapist handoff'],
    color: 'from-red-500 to-rose-500',
  },
];

const ARCHETYPES = [
  {
    name: 'Drifter',
    emoji: '🌊',
    desc: 'Gentle souls seeking direction',
    tone: 'Playful, nurturing guidance',
    color: 'from-blue-400 to-cyan-400',
    traits: ['Introspective', 'Creative', 'Sensitive']
  },
  {
    name: 'Thinker',
    emoji: '🧠',
    desc: 'Analytical minds craving clarity',
    tone: 'Structured, logical dialogue',
    color: 'from-violet-400 to-purple-400',
    traits: ['Analytical', 'Curious', 'Methodical']
  },
  {
    name: 'Transformer',
    emoji: '🔥',
    desc: 'Resilient spirits embracing change',
    tone: 'Empowering, action-oriented',
    color: 'from-orange-400 to-red-400',
    traits: ['Resilient', 'Driven', 'Bold']
  },
  {
    name: 'Seeker',
    emoji: '🌱',
    desc: 'Curious hearts exploring depths',
    tone: 'Safe, patient exploration',
    color: 'from-green-400 to-emerald-400',
    traits: ['Open', 'Spiritual', 'Growth-focused']
  },
  {
    name: 'Veteran',
    emoji: '⚔️',
    desc: 'Weathered warriors sharing wisdom',
    tone: 'Direct, no-nonsense honesty',
    color: 'from-amber-400 to-yellow-400',
    traits: ['Experienced', 'Stoic', 'Mentor-like']
  },
];

const STATS = [
  { value: '50+', label: 'Therapeutic Prompts', icon: PenTool },
  { value: '5', label: 'Unique Archetypes', icon: Users },
  { value: '24/7', label: 'AI Support', icon: MessageCircle },
  { value: '<30s', label: 'Crisis Response', icon: Zap },
  { value: 'AES-256', label: 'Encryption', icon: Lock },
  { value: '100%', label: 'Privacy First', icon: Shield },
];

const ONBOARDING_STEPS = [
  {
    step: 1,
    title: 'Fog Tunnel',
    description: 'Enter through the mist. An immersive animated experience that sets the tone for your journey.',
    icon: Eye,
    color: 'text-veil-400',
  },
  {
    step: 2,
    title: 'ACE Questionnaire',
    description: '10 narrative questions exploring your past, presented one at a time with gentle framing.',
    icon: FileText,
    color: 'text-blue-400',
  },
  {
    step: 3,
    title: 'Trauma Quest',
    description: '3-5 guided story prompts to help process difficult experiences safely.',
    icon: Compass,
    color: 'text-amber-400',
  },
  {
    step: 4,
    title: 'Mood Calibration',
    description: 'Interactive Plutchik-based emotion wheel to calibrate your baseline.',
    icon: Heart,
    color: 'text-rose-400',
  },
  {
    step: 5,
    title: 'Archetype Reveal',
    description: 'Discover your psychological archetype through a cinematic reveal animation.',
    icon: Sparkles,
    color: 'text-oracle-400',
  },
];

const TESTIMONIALS = [
  {
    quote: "The AI companion feels like it truly understands my thought patterns. It's like having a wise friend available 24/7.",
    author: "Sarah M.",
    role: "Thinker Archetype",
    avatar: "🧠",
  },
  {
    quote: "The breathing exercises with the fog animation helped me through a panic attack. The grounding prompts are perfect.",
    author: "James K.",
    role: "Seeker Archetype",
    avatar: "🌱",
  },
  {
    quote: "As an HR director, the anonymized department insights help us support our team without invading privacy.",
    author: "Linda R.",
    role: "HR Director",
    avatar: "📊",
  },
];

const DIFFERENTIATORS = [
  {
    title: 'Narrative, Not Clinical',
    description: 'Clinical assessments (PHQ-9, GAD-7) are woven into gentle, story-like questions. No cold questionnaires.',
    icon: BookOpen,
  },
  {
    title: 'Archetype Personalization',
    description: "Your AI companion's personality, prompts, and even notification tone adapt to your psychological archetype.",
    icon: Users,
  },
  {
    title: 'Multi-Tier Safety Net',
    description: 'AI Companion → AI Twin Review → Human Therapist. Escalation happens in under 30 seconds.',
    icon: Shield,
  },
  {
    title: 'Consent-First Privacy',
    description: "You control every bit of data sharing. Therapists see anonymized data by default—you grant access explicitly.",
    icon: Lock,
  },
];

export default function LandingPage() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -100]);

  return (
    <main className="min-h-screen bg-midnight-950 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="font-display text-xl font-bold">
              <span className="text-gradient-veil">Cere</span>
              <span className="text-gradient-oracle">Bro</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            <a href="#features" className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">Features</a>
            <a href="#how-it-works" className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">How It Works</a>
            <a href="#archetypes" className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">Archetypes</a>
            <a href="#enterprise" className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">Enterprise</a>
            <a href="#clinical" className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">For Clinicians</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="text-gray-300 hover:text-white hover:bg-white/5">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild className="btn-primary">
              <Link href="/auth/register">Start Free</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={targetRef} className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Modern animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          <div className="aurora" />

          {/* Additional glow effects */}
          <div className="absolute w-[600px] h-[600px] rounded-full bg-violet-500/10 blur-[150px] animate-float -top-20 -left-20" />
          <div className="absolute w-[500px] h-[500px] rounded-full bg-fuchsia-500/10 blur-[120px] animate-float-delayed bottom-10 right-10" />

          {/* Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
        </div>

        <motion.div
          style={{ opacity, scale, y }}
          className="relative z-10 text-center max-w-5xl mx-auto px-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="glass-card inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-gray-200">Narrative-Driven Mental Wellness Platform</span>
              <span className="text-xs bg-violet-500/30 text-violet-300 px-2 py-0.5 rounded-full ml-1">AI-Powered</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="font-display text-6xl md:text-8xl font-bold mb-6 leading-tight"
          >
            <span className="text-gradient-veil">Your Mind</span>
            <br />
            <span className="text-white">is a </span>
            <span className="text-gradient-oracle">Labyrinth</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-400 mb-4 max-w-2xl mx-auto"
          >
            We walk it with you.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-base text-gray-500 mb-12 max-w-xl mx-auto"
          >
            An AI-powered mental wellness companion that discovers your psychological archetype,
            adapts to your unique patterns, and guides you through mood tracking, journaling,
            breathwork, and crisis support—with real therapist backup when you need it.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button asChild size="lg" className="btn-glow text-lg px-10 h-14 rounded-2xl">
              <Link href="/auth/register">
                Begin Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="glass-interactive text-lg px-10 h-14 rounded-2xl border-white/20">
              <a href="#how-it-works">
                <Play className="w-5 h-5 mr-2" />
                See How It Works
              </a>
            </Button>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ChevronDown className="w-6 h-6 text-gray-500" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
            {STATS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <Icon className="w-5 h-5 text-veil-400 mx-auto mb-2" />
                  <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Not Just Another <span className="text-gradient-veil">Wellness App</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              CereBro combines Jungian psychology, clinical assessments, and AI to create a deeply personal mental wellness experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DIFFERENTIATORS.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-veil-500/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-veil-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works - Onboarding Journey */}
      <section id="how-it-works" className="py-32 relative bg-gradient-to-b from-transparent via-veil-950/10 to-transparent">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Your Journey <span className="text-gradient-oracle">Begins</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              A narrative onboarding experience that discovers your archetype and personalizes everything that follows.
            </p>
          </motion.div>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-veil-500/20 via-oracle-500/20 to-veil-500/20 -translate-y-1/2" />

            <div className="grid lg:grid-cols-5 gap-8">
              {ONBOARDING_STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 }}
                    className="relative text-center"
                  >
                    <div className="relative z-10 mx-auto w-16 h-16 rounded-2xl bg-[#0a0a12] border border-white/10 flex items-center justify-center mb-4">
                      <Icon className={`w-7 h-7 ${step.color}`} />
                    </div>
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#0a0a12] border border-white/5 flex items-center justify-center text-xs font-bold text-gray-500">
                      {step.step}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 mt-6">{step.title}</h3>
                    <p className="text-sm text-gray-400">{step.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Your Wellness <span className="text-gradient-veil">Toolkit</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Six interconnected modules designed to meet you where you are and guide you forward.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all hover:bg-white/[0.04]"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} p-0.5 mb-4`}>
                    <div className="w-full h-full rounded-xl bg-[#0a0a12] flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{feature.description}</p>
                  <ul className="space-y-1">
                    {feature.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-gray-500">
                        <CheckCircle className="w-3 h-3 text-veil-400" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gamification Section */}
      <section className="py-24 relative bg-gradient-to-b from-transparent via-amber-950/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
                <Award className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-amber-400">Gamification</span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                Earn <span className="text-gradient-oracle">Badges</span>, Build <span className="text-gradient-veil">Streaks</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Mental wellness is a practice. CereBro rewards consistency with badges, streak tracking,
                and progress visualizations that celebrate your journey without gamifying your struggles.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: '🏅', name: 'First Breath', desc: 'Complete your first breathing session' },
                  { icon: '🔥', name: '7-Day Streak', desc: 'Check in for 7 consecutive days' },
                  { icon: '📝', name: 'Shadow Scribe', desc: 'Write 10 shadow work journal entries' },
                  { icon: '🌙', name: 'Night Owl', desc: 'Complete a late-night check-in' },
                ].map((badge, i) => (
                  <motion.div
                    key={badge.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
                  >
                    <div className="text-2xl mb-2">{badge.icon}</div>
                    <p className="text-sm font-medium text-white">{badge.name}</p>
                    <p className="text-xs text-gray-500">{badge.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 p-8 flex flex-col items-center justify-center">
                <div className="text-6xl mb-4">🎯</div>
                <div className="text-5xl font-bold text-white mb-2">14</div>
                <p className="text-amber-400 font-medium">Day Streak</p>
                <div className="mt-6 flex gap-1">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-lg ${i < 5 ? 'bg-amber-500/30' : 'bg-white/5'} flex items-center justify-center text-xs`}
                    >
                      {i < 5 ? '✓' : ''}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4">Current week progress</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Archetypes Section */}
      <section id="archetypes" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Discover Your <span className="text-gradient-oracle">Archetype</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Based on Jungian psychology, your archetype shapes how your AI companion speaks,
              which prompts you receive, and how your journey unfolds.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-4">
            {ARCHETYPES.map((archetype, index) => (
              <motion.div
                key={archetype.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all text-center h-full">
                  <div className="text-5xl mb-4">{archetype.emoji}</div>
                  <h3 className={`text-xl font-semibold bg-gradient-to-r ${archetype.color} bg-clip-text text-transparent mb-2`}>
                    {archetype.name}
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">{archetype.desc}</p>
                  <p className="text-xs text-gray-500 italic mb-4">"{archetype.tone}"</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {archetype.traits.map((trait, i) => (
                      <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-white/5 text-gray-400">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Microcircles */}
      <section className="py-24 relative bg-gradient-to-b from-transparent via-green-950/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="aspect-video rounded-3xl bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-transparent border border-emerald-500/20 p-8 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-4">
                  {['🌊 Drifters', '🧠 Thinkers', '🔥 Transformers'].map((circle, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                      <p className="text-sm font-medium text-white">{circle}</p>
                      <p className="text-xs text-gray-500 mt-1">23/50 members</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <Users className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-400">Community</span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                <span className="text-gradient-veil">Microcircles</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Connect with others who share your archetype. Anonymous by default,
                with moderated spaces organized by archetype, region, and language.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  'Anonymous posting (default)',
                  'Archetype-based matching',
                  'Max 50 members per circle',
                  'AI-powered content moderation',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Voices from the <span className="text-gradient-oracle">Labyrinth</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/5"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{testimonial.avatar}</div>
                  <div>
                    <p className="font-medium text-white">{testimonial.author}</p>
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section id="enterprise" className="py-32 relative bg-gradient-to-b from-transparent via-amber-950/10 to-transparent">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-amber-400">For Organizations</span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                Workplace <span className="text-gradient-veil">Wellness</span> at Scale
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Aggregate, anonymized insights for HR teams. Understand organizational mental health trends,
                predict attrition risks, and generate ESG compliance reports—all while protecting individual privacy.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  { text: 'Department-level stress heatmaps', desc: 'Green/yellow/red zone visualization' },
                  { text: 'Attrition risk predictions', desc: 'ML-powered early warning system' },
                  { text: 'ESG report generation', desc: 'One-click PDF compliance reports' },
                  { text: 'Strict k-anonymity (min 5)', desc: 'No individual data exposure' },
                  { text: 'Daily refresh only', desc: 'No real-time surveillance' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">{item.text}</span>
                      <span className="text-gray-500 text-sm ml-2">— {item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500">
                <Link href="/auth/register">
                  Request Enterprise Demo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 p-8 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-4 w-full">
                  {['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Ops', 'Support', 'Legal', 'Product'].map((dept, i) => (
                    <motion.div
                      key={dept}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center p-2 ${
                        i === 1 || i === 5 ? 'bg-red-500/30' : i === 4 ? 'bg-amber-500/30' : 'bg-emerald-500/30'
                      }`}
                    >
                      <p className="text-xs text-white font-medium">{dept}</p>
                      <p className="text-[10px] text-gray-400">{i === 1 || i === 5 ? '72%' : i === 4 ? '55%' : '35%'}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center mt-4">Stress Heatmap (anonymized)</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Insurance API Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="aspect-video rounded-3xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/20 p-8">
                <div className="font-mono text-sm">
                  <p className="text-gray-500">// Insurance Risk Score API</p>
                  <p className="text-blue-400">GET /api/insurance/risk-score</p>
                  <div className="mt-4 p-4 rounded-lg bg-black/30">
                    <p className="text-gray-400">{'{'}</p>
                    <p className="text-emerald-400 ml-4">"tokenized_user": "8f3a9c...",</p>
                    <p className="text-amber-400 ml-4">"risk_score": 0.32,</p>
                    <p className="text-cyan-400 ml-4">"ritual_adherence": 0.85,</p>
                    <p className="text-purple-400 ml-4">"sentiment_avg": 0.72</p>
                    <p className="text-gray-400">{'}'}</p>
                  </div>
                  <p className="text-xs text-gray-600 mt-4">Response time: 127ms • Cached for 1hr</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-400">Insurance Partners</span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                Risk Scoring <span className="text-gradient-veil">API</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Provide insurance partners with anonymized, tokenized risk scores.
                No raw text, no identifiable data—just aggregated wellness metrics.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  'HMAC-SHA256 tokenized user IDs',
                  'Risk score = adherence + sentiment + trends',
                  '<500ms response with Redis caching',
                  'Rate limited (1000 req/hr)',
                  'Zero raw text exposure',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Clinical Section */}
      <section id="clinical" className="py-32 relative bg-gradient-to-b from-transparent via-cyan-950/10 to-transparent">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="aspect-video rounded-3xl bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent border border-cyan-500/20 p-8">
                <div className="bg-black/20 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Brain className="w-6 h-6 text-cyan-400" />
                    <span className="text-white font-medium">AI Twin Case Brief</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Risk Level:</span>
                      <span className="text-amber-400 font-medium">Moderate (62%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Primary Concern:</span>
                      <span className="text-white">Anxiety, Sleep Issues</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Journal Sentiment:</span>
                      <span className="text-emerald-400">Improving ↑</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Generated in 2.3s • Consent: Granted</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
                <Stethoscope className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-cyan-400">For Clinicians</span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                <span className="text-gradient-oracle">AI-Powered</span> Case Management
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Receive escalated cases with AI-generated briefs. Our AI Twin analyzes mood patterns,
                journal sentiment, and risk factors to give you a comprehensive patient overview before your first session.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  'Automated 1-2 page case briefs',
                  'Risk assessment with PHQ-9/GAD-7 trends',
                  'Pattern recognition across entries',
                  'Anonymized by default (consent unlocks identity)',
                  'Secure therapist verification flow',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500">
                <Link href="/auth/therapist-register">
                  Join as Therapist
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-32 relative">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Lock className="w-16 h-16 text-veil-400 mx-auto mb-6" />
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Your Mind, <span className="text-gradient-veil">Your Data</span>
            </h2>
            <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
              Every journal entry, mood reflection, and chat message is encrypted with AES-256.
              We can't read your data—and neither can anyone else.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Lock, title: 'AES-256 Encryption', desc: 'Military-grade encryption for all personal data' },
                { icon: Shield, title: 'HIPAA Ready', desc: 'Built with healthcare compliance in mind' },
                { icon: UserCheck, title: 'Consent-First', desc: 'Explicit opt-in before any data sharing' },
                { icon: FileText, title: 'Audit Logging', desc: 'Every access logged for compliance' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 rounded-2xl bg-white/[0.02] border border-white/5"
                  >
                    <Icon className="w-8 h-8 text-veil-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative p-12 rounded-3xl bg-gradient-to-br from-veil-900/50 via-oracle-900/30 to-veil-900/50 border border-white/10 overflow-hidden"
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-veil-500/10 via-transparent to-oracle-500/10" />

            <div className="relative z-10">
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Ready to Enter the <span className="text-gradient-oracle">Labyrinth</span>?
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                Your journey toward understanding begins with a single step.
                Discover your archetype, meet your AI companion, and start building healthier mental habits today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-black hover:bg-gray-100 text-lg px-8 h-14">
                  <Link href="/auth/register">
                    Begin Your Journey — It's Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-6">No credit card required • Full access to core features</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-veil-500 to-oracle-500 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="font-display text-xl font-bold">
                  <span className="text-gradient-veil">Cere</span>
                  <span className="text-gradient-oracle">Bro</span>
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Narrative-driven mental wellness for individuals, organizations, and clinicians.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">For You</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/auth/register" className="hover:text-white transition-colors">Get Started</Link></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#archetypes" className="hover:text-white transition-colors">Archetypes</a></li>
                <li><Link href="/auth/login" className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">For Business</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#enterprise" className="hover:text-white transition-colors">Enterprise</a></li>
                <li><a href="#clinical" className="hover:text-white transition-colors">For Clinicians</a></li>
                <li><Link href="/auth/therapist-register" className="hover:text-white transition-colors">Join as Therapist</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Crisis Resources</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  <span>US: 988 (Suicide & Crisis)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  <span>UK: 116 123 (Samaritans)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  <span>India: 9152987821 (iCall)</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              © 2024 CereBro. Your mind matters.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">HIPAA Notice</a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <p className="text-xs text-red-400">
                If you are in crisis, please call your local emergency services or a crisis helpline immediately.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
