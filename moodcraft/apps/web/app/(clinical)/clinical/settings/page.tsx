'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import {
  Settings,
  Bell,
  Shield,
  Clock,
  Mail,
  Phone,
  Save,
  Loader2,
} from 'lucide-react';

export default function ClinicalSettingsPage() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: 'Settings saved',
        description: 'Your clinical settings have been updated.',
      });
    } finally {
      setSaving(false);
    }
  };

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    escalationAlerts: true,
    dailyDigest: true,
    autoAcceptCases: false,
    maxCaseload: '15',
    availableHours: '9:00 AM - 5:00 PM',
  });

  return (
    <main className="min-h-screen bg-[#0a0a12] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Settings className="w-7 h-7 text-cyan-400" />
              Clinical Settings
            </h1>
            <p className="text-gray-400 mt-1">Configure your clinical portal preferences</p>
          </div>

          <div className="space-y-6">
            {/* Notifications */}
            <Card className="bg-white/[0.02] border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                <Bell className="w-5 h-5 text-cyan-400" />
                Notifications
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(v) => setSettings({ ...settings, emailNotifications: v })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">SMS Notifications</Label>
                    <p className="text-sm text-gray-500">Receive urgent alerts via SMS</p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(v) => setSettings({ ...settings, smsNotifications: v })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Escalation Alerts</Label>
                    <p className="text-sm text-gray-500">Immediate alerts for critical escalations</p>
                  </div>
                  <Switch
                    checked={settings.escalationAlerts}
                    onCheckedChange={(v) => setSettings({ ...settings, escalationAlerts: v })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Daily Digest</Label>
                    <p className="text-sm text-gray-500">Summary of daily activity</p>
                  </div>
                  <Switch
                    checked={settings.dailyDigest}
                    onCheckedChange={(v) => setSettings({ ...settings, dailyDigest: v })}
                  />
                </div>
              </div>
            </Card>

            {/* Case Management */}
            <Card className="bg-white/[0.02] border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5 text-cyan-400" />
                Case Management
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Auto-Accept Cases</Label>
                    <p className="text-sm text-gray-500">Automatically accept new case assignments</p>
                  </div>
                  <Switch
                    checked={settings.autoAcceptCases}
                    onCheckedChange={(v) => setSettings({ ...settings, autoAcceptCases: v })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Maximum Caseload</Label>
                    <Input
                      type="number"
                      value={settings.maxCaseload}
                      onChange={(e) => setSettings({ ...settings, maxCaseload: e.target.value })}
                      className="mt-2 bg-white/5 border-white/10"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Available Hours</Label>
                    <Input
                      value={settings.availableHours}
                      onChange={(e) => setSettings({ ...settings, availableHours: e.target.value })}
                      className="mt-2 bg-white/5 border-white/10"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button className="bg-cyan-600 hover:bg-cyan-500" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
