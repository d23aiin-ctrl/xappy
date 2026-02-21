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
  Building2,
  Save,
  Users,
  Loader2,
} from 'lucide-react';

export default function CorporateSettingsPage() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: 'Settings saved',
        description: 'Corporate settings have been updated.',
      });
    } finally {
      setSaving(false);
    }
  };

  const [settings, setSettings] = useState({
    weeklyDigest: true,
    escalationAlerts: true,
    monthlyReports: true,
    anonymizationLevel: 'department',
    minGroupSize: '5',
    orgName: 'TechFlow Industries',
    orgDomain: 'techflow.io',
  });

  return (
    <main className="min-h-screen bg-[#0a0a12] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Settings className="w-7 h-7 text-amber-400" />
              Corporate Settings
            </h1>
            <p className="text-gray-400 mt-1">Configure your corporate wellness portal</p>
          </div>

          <div className="space-y-6">
            {/* Organization Info */}
            <Card className="bg-white/[0.02] border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                <Building2 className="w-5 h-5 text-amber-400" />
                Organization
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Organization Name</Label>
                  <Input
                    value={settings.orgName}
                    onChange={(e) => setSettings({ ...settings, orgName: e.target.value })}
                    className="mt-2 bg-white/5 border-white/10"
                  />
                </div>
                <div>
                  <Label className="text-white">Domain</Label>
                  <Input
                    value={settings.orgDomain}
                    onChange={(e) => setSettings({ ...settings, orgDomain: e.target.value })}
                    className="mt-2 bg-white/5 border-white/10"
                  />
                </div>
              </div>
            </Card>

            {/* Notifications */}
            <Card className="bg-white/[0.02] border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                <Bell className="w-5 h-5 text-amber-400" />
                Notifications
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Weekly Digest</Label>
                    <p className="text-sm text-gray-500">Receive weekly wellness summary</p>
                  </div>
                  <Switch
                    checked={settings.weeklyDigest}
                    onCheckedChange={(v) => setSettings({ ...settings, weeklyDigest: v })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Escalation Alerts</Label>
                    <p className="text-sm text-gray-500">Alerts for high-risk indicators</p>
                  </div>
                  <Switch
                    checked={settings.escalationAlerts}
                    onCheckedChange={(v) => setSettings({ ...settings, escalationAlerts: v })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Monthly Reports</Label>
                    <p className="text-sm text-gray-500">Auto-generate monthly ESG reports</p>
                  </div>
                  <Switch
                    checked={settings.monthlyReports}
                    onCheckedChange={(v) => setSettings({ ...settings, monthlyReports: v })}
                  />
                </div>
              </div>
            </Card>

            {/* Privacy & Anonymization */}
            <Card className="bg-white/[0.02] border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5 text-amber-400" />
                Privacy & Anonymization
              </h3>

              <div className="space-y-4">
                <div>
                  <Label className="text-white">Minimum Group Size (k-anonymity)</Label>
                  <p className="text-sm text-gray-500 mb-2">
                    Minimum employees required to display aggregated data
                  </p>
                  <Input
                    type="number"
                    value={settings.minGroupSize}
                    onChange={(e) => setSettings({ ...settings, minGroupSize: e.target.value })}
                    className="w-32 bg-white/5 border-white/10"
                    min="3"
                  />
                </div>

                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-amber-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-200">Data Protection</p>
                      <p className="text-xs text-gray-400 mt-1">
                        All employee data is anonymized and aggregated. Individual-level data is never
                        accessible through the corporate dashboard. Minimum group size of {settings.minGroupSize} ensures
                        k-anonymity compliance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button className="bg-amber-600 hover:bg-amber-500" onClick={handleSave} disabled={saving}>
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
