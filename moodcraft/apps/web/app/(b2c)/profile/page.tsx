'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/shared/app-header';
import Link from 'next/link';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  archetype: string;
  createdAt: string;
  stats: {
    streakDays: number;
    longestStreak: number;
    moodCheckins: number;
    journalEntries: number;
    breathSessions: number;
    totalMinutes: number;
  };
  badges: {
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: string;
  }[];
}

const ARCHETYPE_INFO: Record<string, { title: string; description: string; traits: string[]; color: string; gradient: string; icon: string }> = {
  DRIFTER: {
    title: 'The Drifter',
    description: 'You navigate the fog with gentle curiosity. Your journey is one of exploration and quiet discovery.',
    traits: ['Adaptable', 'Intuitive', 'Open-minded', 'Reflective'],
    color: '#60a5fa',
    gradient: 'from-blue-500 to-cyan-500',
    icon: '🌊',
  },
  THINKER: {
    title: 'The Thinker',
    description: 'Your mind is a labyrinth of ideas. You seek understanding through analysis and introspection.',
    traits: ['Analytical', 'Curious', 'Strategic', 'Thoughtful'],
    color: '#8b5cf6',
    gradient: 'from-veil-500 to-indigo-500',
    icon: '🧠',
  },
  TRANSFORMER: {
    title: 'The Transformer',
    description: 'You embrace change as a catalyst for growth. Your strength lies in turning challenges into opportunities.',
    traits: ['Resilient', 'Determined', 'Growth-oriented', 'Courageous'],
    color: '#f97316',
    gradient: 'from-orange-500 to-red-500',
    icon: '🔥',
  },
  SEEKER: {
    title: 'The Seeker',
    description: 'You search for meaning beneath the surface. Your path is one of deep exploration and truth.',
    traits: ['Perceptive', 'Patient', 'Empathetic', 'Wise'],
    color: '#10b981',
    gradient: 'from-emerald-500 to-teal-500',
    icon: '🔮',
  },
  VETERAN: {
    title: 'The Veteran',
    description: 'You carry wisdom forged through experience. Your journey has given you strength and perspective.',
    traits: ['Experienced', 'Grounded', 'Supportive', 'Steadfast'],
    color: '#f59e0b',
    gradient: 'from-amber-500 to-yellow-500',
    icon: '⭐',
  },
};

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  // Default demo data
  const profileData = profile || {
    id: '1',
    name: session?.user?.name || 'Traveler',
    email: session?.user?.email || 'user@example.com',
    archetype: 'SEEKER',
    createdAt: new Date().toISOString(),
    stats: {
      streakDays: 7,
      longestStreak: 14,
      moodCheckins: 23,
      journalEntries: 12,
      breathSessions: 18,
      totalMinutes: 340,
    },
    badges: [],
  };

  const archetypeInfo = ARCHETYPE_INFO[profileData.archetype] || ARCHETYPE_INFO.SEEKER;
  const memberSince = new Date(profileData.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <motion.div
          className="w-12 h-12 rounded-full border-2 border-veil-500/30 border-t-veil-400"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </main>
    );
  }

  return (
    <>
      <AppHeader />
      <main className="min-h-screen bg-[#0a0a12] relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[200px] opacity-20"
          style={{ backgroundColor: archetypeInfo.color }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-4 md:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Profile</h1>
            <p className="text-gray-400">Your journey at a glance</p>
          </div>
          <Link href="/settings">
            <Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Button>
          </Link>
        </motion.div>

        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/5 border-white/10 mb-6 overflow-hidden">
            <div className={`h-24 bg-gradient-to-r ${archetypeInfo.gradient}`} />
            <CardContent className="pt-0 -mt-12">
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <div className="w-24 h-24 rounded-2xl bg-[#0a0a12] border-4 border-[#0a0a12] flex items-center justify-center text-4xl">
                  {archetypeInfo.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white">{profileData.name}</h2>
                  <p className="text-gray-400">{profileData.email}</p>
                  <p className="text-sm text-gray-500">Member since {memberSince}</p>
                </div>
                <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${archetypeInfo.gradient} text-white text-sm font-medium`}>
                  {archetypeInfo.title}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Archetype Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className={`bg-gradient-to-br ${archetypeInfo.gradient}/10 border-white/10 mb-6`}>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span className="text-2xl">{archetypeInfo.icon}</span>
                Your Archetype: {archetypeInfo.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">{archetypeInfo.description}</p>
              <div className="flex flex-wrap gap-2">
                {archetypeInfo.traits.map((trait) => (
                  <span
                    key={trait}
                    className="px-3 py-1 rounded-full bg-white/10 text-sm text-white"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6"
        >
          <StatCard icon="🔥" value={profileData.stats.streakDays} label="Day Streak" color="text-ember-400" />
          <StatCard icon="🏆" value={profileData.stats.longestStreak} label="Best Streak" color="text-amber-400" />
          <StatCard icon="🪞" value={profileData.stats.moodCheckins} label="Mood Check-ins" color="text-veil-400" />
          <StatCard icon="📝" value={profileData.stats.journalEntries} label="Journal Entries" color="text-oracle-400" />
          <StatCard icon="🌬️" value={profileData.stats.breathSessions} label="Breath Sessions" color="text-cyan-400" />
          <StatCard icon="⏱️" value={profileData.stats.totalMinutes} label="Minutes Practiced" color="text-emerald-400" />
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Badges Earned</CardTitle>
            </CardHeader>
            <CardContent>
              {profileData.badges.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {profileData.badges.map((badge) => (
                    <div
                      key={badge.id}
                      className="bg-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition-colors"
                    >
                      <div className="text-3xl mb-2">{badge.icon}</div>
                      <p className="text-sm font-medium text-white">{badge.name}</p>
                      <p className="text-xs text-gray-500">{badge.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🏅</div>
                  <p className="text-gray-400 mb-2">No badges yet</p>
                  <p className="text-sm text-gray-500">
                    Complete rituals and maintain streaks to earn badges
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
    </>
  );
}

function StatCard({ icon, value, label, color }: { icon: string; value: number; label: string; color: string }) {
  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-400">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
