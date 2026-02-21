'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Stethoscope, Building2, Shield } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { email: 'maya@demo.cerebro.app', password: 'demo123', label: 'User', desc: '→ Dashboard', icon: User, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20' },
  { email: 'therapist@cerebro.app', password: 'demo123', label: 'Therapist', desc: '→ Clinical', icon: Stethoscope, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20' },
  { email: 'hr@techflow.io', password: 'demo123', label: 'HR', desc: '→ Corporate', icon: Building2, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20' },
  { email: 'admin@cerebro.app', password: 'demo123', label: 'Admin', desc: '→ Admin', icon: Shield, color: 'text-veil-400 bg-veil-500/10 border-veil-500/30 hover:bg-veil-500/20' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fillDemoAccount = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      // Fetch user session to get role and onboarding status
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();
      const role = session?.user?.role;

      // For individuals, check if onboarding is complete
      if (role === 'INDIVIDUAL') {
        const profileRes = await fetch('/api/profile');
        const profile = await profileRes.json();

        // Redirect to onboarding if not completed
        if (!profile?.onboardingComplete) {
          router.push('/onboarding');
          router.refresh();
          return;
        }
      }

      // Redirect based on role
      const redirectMap: Record<string, string> = {
        INDIVIDUAL: '/dashboard',
        THERAPIST: '/clinical',
        HR: '/corporate',
        ADMIN: '/admin',
        SUPER_ADMIN: '/admin',
      };

      router.push(redirectMap[role] || '/dashboard');
      router.refresh();
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center fog-bg px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-veil-500/5 blur-[100px] animate-fog-drift -top-20 -left-20" />
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
          <p className="text-muted-foreground mt-2 text-sm">Return to the path</p>
        </div>

        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-xl">Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to continue your journey</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/5"
                />
              </div>

              <Button type="submit" className="w-full" variant="veil" disabled={loading}>
                {loading ? <span className="oracle-spinner inline-block w-5 h-5" /> : 'Enter the Labyrinth'}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                New to CereBro?{' '}
                <Link href="/auth/register" className="text-veil-400 hover:text-veil-300 underline">
                  Begin your journey
                </Link>
              </div>

              {/* Demo Accounts */}
              <div className="pt-4 mt-4 border-t border-white/10">
                <p className="text-xs text-gray-500 text-center mb-3">Quick Demo Login</p>
                <div className="grid grid-cols-2 gap-2">
                  {DEMO_ACCOUNTS.map((account) => {
                    const Icon = account.icon;
                    return (
                      <button
                        key={account.email}
                        type="button"
                        onClick={() => fillDemoAccount(account.email, account.password)}
                        className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${account.color}`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5" />
                          {account.label}
                        </span>
                        <span className="text-[10px] opacity-70">{account.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
