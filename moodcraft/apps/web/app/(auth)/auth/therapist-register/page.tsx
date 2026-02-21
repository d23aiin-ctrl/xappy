'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Stethoscope,
  User,
  Mail,
  Lock,
  FileText,
  GraduationCap,
  Languages,
  Heart,
  ArrowRight,
  ArrowLeft,
  Shield,
  CheckCircle,
} from 'lucide-react';

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

export default function TherapistRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    licenseNumber: '',
    licenseState: '',
    yearsExperience: '',
    specializations: [] as string[],
    languages: ['English'] as string[],
    bio: '',
    approachDescription: '',
    qualifications: [{ degree: '', institution: '', year: '' }],
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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

  const addQualification = () => {
    setFormData((prev) => ({
      ...prev,
      qualifications: [...prev.qualifications, { degree: '', institution: '', year: '' }],
    }));
  };

  const updateQualification = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      qualifications: prev.qualifications.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      ),
    }));
  };

  async function handleSubmit() {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/therapist-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          yearsExperience: parseInt(formData.yearsExperience) || 0,
          qualifications: formData.qualifications.filter((q) => q.degree),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setStep(4); // Success step
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const canProceedStep1 = formData.name && formData.email && formData.password;
  const canProceedStep2 = formData.licenseNumber && formData.licenseState;
  const canProceedStep3 = formData.bio && formData.specializations.length > 0;

  return (
    <main className="min-h-screen bg-[#0a0a12] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-veil-600/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        <Card className="bg-white/[0.03] border-white/10 backdrop-blur-xl">
          <CardHeader className="text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center mb-4">
              <Stethoscope className="w-7 h-7 text-cyan-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Join as a Therapist
            </CardTitle>
            <CardDescription className="text-gray-400">
              {step === 1 && 'Create your professional account'}
              {step === 2 && 'Verify your credentials'}
              {step === 3 && 'Build your digital persona'}
              {step === 4 && 'Registration complete'}
            </CardDescription>

            {/* Progress indicator */}
            {step < 4 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full transition-all ${
                      s === step
                        ? 'w-8 bg-cyan-500'
                        : s < step
                          ? 'w-4 bg-cyan-500/50'
                          : 'w-4 bg-white/10'
                    }`}
                  />
                ))}
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Step 1: Account Info */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <User className="w-4 h-4" /> Full Name
                  </Label>
                  <Input
                    placeholder="Dr. Jane Smith"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Professional Email
                  </Label>
                  <Input
                    type="email"
                    placeholder="jane.smith@practice.com"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Password
                  </Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>

                <Button
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {/* Step 2: Credentials */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> License Number
                  </Label>
                  <Input
                    placeholder="PSY-12345"
                    value={formData.licenseNumber}
                    onChange={(e) => updateField('licenseNumber', e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> License State/Region
                  </Label>
                  <Input
                    placeholder="California"
                    value={formData.licenseState}
                    onChange={(e) => updateField('licenseState', e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Years of Experience</Label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={formData.yearsExperience}
                    onChange={(e) => updateField('yearsExperience', e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" /> Qualifications
                  </Label>
                  {formData.qualifications.map((qual, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="PhD"
                        value={qual.degree}
                        onChange={(e) => updateQualification(index, 'degree', e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 text-sm"
                      />
                      <Input
                        placeholder="Institution"
                        value={qual.institution}
                        onChange={(e) => updateQualification(index, 'institution', e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 text-sm"
                      />
                      <Input
                        placeholder="Year"
                        value={qual.year}
                        onChange={(e) => updateQualification(index, 'year', e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 text-sm"
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addQualification}
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    + Add Another
                  </Button>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setStep(1)}
                    className="text-gray-400"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!canProceedStep2}
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                  >
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Digital Persona */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <Heart className="w-4 h-4" /> Professional Bio
                  </Label>
                  <Textarea
                    placeholder="Share your approach to mental health care and what clients can expect when working with you..."
                    value={formData.bio}
                    onChange={(e) => updateField('bio', e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Therapeutic Approach</Label>
                  <Textarea
                    placeholder="Describe your therapeutic modalities (CBT, DBT, psychodynamic, etc.) and how you tailor treatment..."
                    value={formData.approachDescription}
                    onChange={(e) => updateField('approachDescription', e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Specializations</Label>
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
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <Languages className="w-4 h-4" /> Languages
                  </Label>
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
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setStep(2)}
                    className="text-gray-400"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!canProceedStep3 || loading}
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                  >
                    {loading ? 'Creating Account...' : 'Complete Registration'}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Registration Submitted
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  Your application is under review. We'll verify your credentials and
                  notify you via email once approved. This typically takes 1-2 business days.
                </p>
                <Button
                  onClick={() => router.push('/auth/login')}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                >
                  Go to Login
                </Button>
              </motion.div>
            )}

            {step < 4 && (
              <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-cyan-400 hover:underline">
                  Sign in
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
