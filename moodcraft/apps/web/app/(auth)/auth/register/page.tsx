'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'INDIVIDUAL', organizationCode: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      router.push('/auth/login?registered=true');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center fog-bg px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-oracle-500/5 blur-[100px] animate-fog-drift bottom-10 right-10" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold">
            <span className="text-gradient-veil">Cere</span>
            <span className="text-gradient-oracle">Bro</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">Begin your journey of self-discovery</p>
        </div>

        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-xl">Create Your Account</CardTitle>
            <CardDescription>Every labyrinth has an entrance. This is yours.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="bg-white/5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="bg-white/5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
                  className="bg-white/5"
                />
              </div>

              <div className="space-y-2">
                <Label>I am a...</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger className="bg-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INDIVIDUAL">Individual seeking wellness</SelectItem>
                    <SelectItem value="HR">HR / Corporate wellness manager</SelectItem>
                    <SelectItem value="THERAPIST">Licensed therapist</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.role === 'HR' && (
                <div className="space-y-2">
                  <Label htmlFor="orgCode">Organization Code</Label>
                  <Input
                    id="orgCode"
                    placeholder="Your organization domain"
                    value={form.organizationCode}
                    onChange={(e) => setForm({ ...form, organizationCode: e.target.value })}
                    className="bg-white/5"
                  />
                </div>
              )}

              <Button type="submit" className="w-full" variant="veil" disabled={loading}>
                {loading ? <span className="oracle-spinner inline-block w-5 h-5" /> : 'Step Into the Fog'}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Already on the path?{' '}
                <Link href="/auth/login" className="text-veil-400 hover:text-veil-300 underline">
                  Return here
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
