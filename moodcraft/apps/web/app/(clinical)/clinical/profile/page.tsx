'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AppHeader } from '@/components/shared/app-header';
import {
  User,
  Shield,
  GraduationCap,
  Languages,
  Heart,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Stethoscope,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

const SPECIALIZATIONS = [
  'Trauma & PTSD',
  'Anxiety Disorders',
  'Depression',
  'Grief & Loss',
  'Relationship Issues',
  'Addiction',
  'Eating Disorders',
  'OCD',
  'ADHD',
  'Personality Disorders',
  'Stress Management',
  'Self-Esteem',
];

const LANGUAGES = ['English', 'Spanish', 'Mandarin', 'Hindi', 'French', 'Arabic', 'Portuguese', 'German'];

interface TherapistProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  licenseNumber: string;
  licenseState?: string;
  specializations: string[];
  languages: string[];
  yearsExperience?: number;
  approachDescription?: string;
  qualifications: { degree: string; institution: string; year: string }[];
  isVerified: boolean;
  isAvailable: boolean;
  maxCaseload: number;
  currentCaseload: number;
}

export default function TherapistProfilePage() {
  const [profile, setProfile] = useState<TherapistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    bio: '',
    approachDescription: '',
    specializations: [] as string[],
    languages: [] as string[],
    isAvailable: true,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch('/api/therapist/profile');
      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        setFormData({
          bio: data.data.bio || '',
          approachDescription: data.data.approachDescription || '',
          specializations: data.data.specializations || [],
          languages: data.data.languages || ['English'],
          isAvailable: data.data.isAvailable,
        });
      }
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    setSaving(true);
    setSaved(false);
    setError('');

    try {
      const res = await fetch('/api/therapist/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save');

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  const toggleSpecialization = (spec: string) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec],
    }));
  };

  const toggleLanguage = (lang: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-400">Profile not found</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <AppHeader />
      <main className="min-h-screen bg-[#0a0a12] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-600/3 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/clinical">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Your Digital Persona</h1>
                <p className="text-sm text-gray-400">
                  Customize how you appear to clients
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {profile.isVerified ? (
                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Pending Verification
                </Badge>
              )}
            </div>
          </div>

          {/* Profile Preview Card */}
          <Card className="bg-white/[0.03] border-white/10 mb-6 overflow-hidden">
            <div className="h-20 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-veil-600/20 relative">
              <div className="absolute -bottom-8 left-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-4 border-[#0a0a12] flex items-center justify-center">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      className="w-full h-full rounded-lg object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-cyan-400" />
                  )}
                </div>
              </div>
            </div>
            <CardContent className="pt-12 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">{profile.name}</h2>
                  <p className="text-sm text-gray-400">{profile.email}</p>
                </div>
                <div className="text-right text-sm text-gray-400">
                  <p>License: {profile.licenseNumber}</p>
                  {profile.licenseState && <p>{profile.licenseState}</p>}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
                <span>Caseload: {profile.currentCaseload}/{profile.maxCaseload}</span>
                {profile.yearsExperience && <span>{profile.yearsExperience}+ years experience</span>}
              </div>
            </CardContent>
          </Card>

          {/* Edit Form */}
          <div className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Availability Toggle */}
            <Card className="bg-white/[0.03] border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-white">Available for New Cases</h3>
                    <p className="text-sm text-gray-400">
                      Toggle off if you're at capacity or on leave
                    </p>
                  </div>
                  <Switch
                    checked={formData.isAvailable}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isAvailable: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Bio */}
            <Card className="bg-white/[0.03] border-white/10">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Heart className="w-4 h-4 text-veil-400" />
                  Professional Bio
                </CardTitle>
                <CardDescription>
                  Share your approach to mental health care
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell clients about yourself and your approach..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 min-h-[120px]"
                />
              </CardContent>
            </Card>

            {/* Therapeutic Approach */}
            <Card className="bg-white/[0.03] border-white/10">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-cyan-400" />
                  Therapeutic Approach
                </CardTitle>
                <CardDescription>
                  Describe your therapeutic modalities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.approachDescription}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, approachDescription: e.target.value }))
                  }
                  placeholder="CBT, DBT, psychodynamic, etc..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 min-h-[100px]"
                />
              </CardContent>
            </Card>

            {/* Specializations */}
            <Card className="bg-white/[0.03] border-white/10">
              <CardHeader>
                <CardTitle className="text-base text-white">Specializations</CardTitle>
                <CardDescription>Select areas you specialize in</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {SPECIALIZATIONS.map((spec) => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => toggleSpecialization(spec)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        formData.specializations.includes(spec)
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Languages */}
            <Card className="bg-white/[0.03] border-white/10">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Languages className="w-4 h-4 text-blue-400" />
                  Languages
                </CardTitle>
                <CardDescription>
                  Languages you can conduct sessions in
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        formData.languages.includes(lang)
                          ? 'bg-veil-500/20 text-veil-400 border border-veil-500/30'
                          : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
              {saved && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-emerald-400"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Saved</span>
                </motion.div>
              )}
              <Button
                onClick={saveProfile}
                disabled={saving}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
    </>
  );
}
