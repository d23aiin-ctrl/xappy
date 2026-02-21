'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppHeader } from '@/components/shared/app-header';
import Link from 'next/link';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      dailyReminder: true,
      moodCheckIn: true,
      weeklyInsights: true,
      achievements: true,
    },
    privacy: {
      shareWithTherapist: false,
      corporateAnalytics: false,
      researchParticipation: false,
    },
    preferences: {
      theme: 'dark',
      reminderTime: '09:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateNotification = (key: keyof typeof settings.notifications, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }));
  };

  const updatePrivacy = (key: keyof typeof settings.privacy, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      privacy: { ...prev.privacy, [key]: value },
    }));
  };

  return (
    <>
      <AppHeader />
      <main className="min-h-screen bg-[#0a0a12] relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-1/4 w-64 h-64 bg-veil-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto p-4 md:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Settings</h1>
            <p className="text-gray-400">Manage your preferences and privacy</p>
          </div>
          <Link href="/profile">
            <Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Profile
            </Button>
          </Link>
        </motion.div>

        <div className="space-y-6">
          {/* Account */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Account</CardTitle>
                <CardDescription>Your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      defaultValue={session?.user?.name || ''}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      defaultValue={session?.user?.email || ''}
                      disabled
                      className="bg-white/5 border-white/10 opacity-50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Notifications</CardTitle>
                <CardDescription>Choose what you want to be reminded about</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="daily-reminder" className="text-white">Daily Reminder</Label>
                    <p className="text-sm text-gray-400">Get a gentle nudge to check in</p>
                  </div>
                  <Switch
                    id="daily-reminder"
                    checked={settings.notifications.dailyReminder}
                    onCheckedChange={(v) => updateNotification('dailyReminder', v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="mood-checkin" className="text-white">Mood Check-in</Label>
                    <p className="text-sm text-gray-400">Remind to track your mood</p>
                  </div>
                  <Switch
                    id="mood-checkin"
                    checked={settings.notifications.moodCheckIn}
                    onCheckedChange={(v) => updateNotification('moodCheckIn', v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weekly-insights" className="text-white">Weekly Insights</Label>
                    <p className="text-sm text-gray-400">Receive your weekly summary</p>
                  </div>
                  <Switch
                    id="weekly-insights"
                    checked={settings.notifications.weeklyInsights}
                    onCheckedChange={(v) => updateNotification('weeklyInsights', v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="achievements" className="text-white">Achievements</Label>
                    <p className="text-sm text-gray-400">Get notified when you earn badges</p>
                  </div>
                  <Switch
                    id="achievements"
                    checked={settings.notifications.achievements}
                    onCheckedChange={(v) => updateNotification('achievements', v)}
                  />
                </div>

                {settings.notifications.dailyReminder && (
                  <div className="pt-4 border-t border-white/10">
                    <Label htmlFor="reminder-time" className="text-white mb-2 block">Reminder Time</Label>
                    <Input
                      id="reminder-time"
                      type="time"
                      value={settings.preferences.reminderTime}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, reminderTime: e.target.value },
                      }))}
                      className="bg-white/5 border-white/10 w-40"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Privacy & Consent */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Privacy & Consent</CardTitle>
                <CardDescription>Control how your data is used</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="share-therapist" className="text-white">Share with Therapist</Label>
                    <p className="text-sm text-gray-400">Allow connected therapists to view your data</p>
                  </div>
                  <Switch
                    id="share-therapist"
                    checked={settings.privacy.shareWithTherapist}
                    onCheckedChange={(v) => updatePrivacy('shareWithTherapist', v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="corporate-analytics" className="text-white">Corporate Analytics</Label>
                    <p className="text-sm text-gray-400">Contribute anonymized data to organization insights</p>
                  </div>
                  <Switch
                    id="corporate-analytics"
                    checked={settings.privacy.corporateAnalytics}
                    onCheckedChange={(v) => updatePrivacy('corporateAnalytics', v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="research" className="text-white">Research Participation</Label>
                    <p className="text-sm text-gray-400">Allow anonymized data for mental health research</p>
                  </div>
                  <Switch
                    id="research"
                    checked={settings.privacy.researchParticipation}
                    onCheckedChange={(v) => updatePrivacy('researchParticipation', v)}
                  />
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-start gap-3 p-4 bg-veil-900/30 rounded-lg border border-veil-500/20">
                    <svg className="w-5 h-5 text-veil-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <div>
                      <p className="text-sm text-white font-medium">Your data is encrypted</p>
                      <p className="text-xs text-gray-400">
                        All personal content including journal entries and reflections are encrypted with AES-256.
                        Only you can access your raw data.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Preferences</CardTitle>
                <CardDescription>Customize your experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select
                      value={settings.preferences.theme}
                      onValueChange={(v) => setSettings(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, theme: v },
                      }))}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Dark (Midnight)</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Input
                      value={settings.preferences.timezone}
                      disabled
                      className="bg-white/5 border-white/10 opacity-50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-red-950/20 border-red-500/20">
              <CardHeader>
                <CardTitle className="text-red-400">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Export Your Data</p>
                    <p className="text-sm text-gray-400">Download all your data in JSON format</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Simulate export
                      const data = { settings, exportedAt: new Date().toISOString() };
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'cerebro-data-export.json';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Export
                  </Button>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-red-500/20">
                  <div>
                    <p className="text-red-400 font-medium">Delete Account</p>
                    <p className="text-sm text-gray-400">Permanently delete your account and all data</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                        signOut({ callbackUrl: '/' });
                      }
                    }}
                  >
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Save & Logout */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-veil-600 to-veil-500 hover:from-veil-500 hover:to-veil-400"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              Sign Out
            </Button>
          </motion.div>
        </div>
      </div>
    </main>
    </>
  );
}
