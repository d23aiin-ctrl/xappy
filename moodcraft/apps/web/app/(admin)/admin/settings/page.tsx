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
  Database,
  Mail,
  Key,
  Save,
  RefreshCw,
  Loader2,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [updatingKey, setUpdatingKey] = useState(false);
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    newRegistrations: true,
    emailVerification: true,
    twoFactorAuth: false,
    sessionTimeout: '30',
    maxLoginAttempts: '5',
    dataRetentionDays: '365',
    auditLogRetention: '90',
    smtpHost: 'smtp.cerebro.app',
    smtpPort: '587',
    openaiApiKey: '••••••••••••••••',
  });

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: 'Settings saved',
        description: 'All system settings have been updated successfully.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateApiKey = async () => {
    setUpdatingKey(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast({
        title: 'API Key updated',
        description: 'OpenAI API key has been updated successfully.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update API key.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingKey(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a12] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Settings className="w-7 h-7 text-emerald-400" />
                System Settings
              </h1>
              <p className="text-gray-400 mt-1">Configure global platform settings</p>
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={handleSaveAll} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {saving ? 'Saving...' : 'Save All Changes'}
            </Button>
          </div>

          <div className="space-y-6">
            {/* System Status */}
            <Card className="bg-white/[0.02] border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                <RefreshCw className="w-5 h-5 text-emerald-400" />
                System Status
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Maintenance Mode</Label>
                    <p className="text-sm text-gray-500">Disable access for all non-admin users</p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(v) => setSettings({ ...settings, maintenanceMode: v })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">New Registrations</Label>
                    <p className="text-sm text-gray-500">Allow new user sign-ups</p>
                  </div>
                  <Switch
                    checked={settings.newRegistrations}
                    onCheckedChange={(v) => setSettings({ ...settings, newRegistrations: v })}
                  />
                </div>
              </div>
            </Card>

            {/* Security */}
            <Card className="bg-white/[0.02] border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5 text-emerald-400" />
                Security
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Email Verification</Label>
                    <p className="text-sm text-gray-500">Require email verification on signup</p>
                  </div>
                  <Switch
                    checked={settings.emailVerification}
                    onCheckedChange={(v) => setSettings({ ...settings, emailVerification: v })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">Require 2FA for all admin users</p>
                  </div>
                  <Switch
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(v) => setSettings({ ...settings, twoFactorAuth: v })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <Label className="text-white">Session Timeout (minutes)</Label>
                    <Input
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                      className="mt-2 bg-white/5 border-white/10"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Max Login Attempts</Label>
                    <Input
                      type="number"
                      value={settings.maxLoginAttempts}
                      onChange={(e) => setSettings({ ...settings, maxLoginAttempts: e.target.value })}
                      className="mt-2 bg-white/5 border-white/10"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Data Retention */}
            <Card className="bg-white/[0.02] border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                <Database className="w-5 h-5 text-emerald-400" />
                Data Retention
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">User Data Retention (days)</Label>
                  <Input
                    type="number"
                    value={settings.dataRetentionDays}
                    onChange={(e) => setSettings({ ...settings, dataRetentionDays: e.target.value })}
                    className="mt-2 bg-white/5 border-white/10"
                  />
                </div>
                <div>
                  <Label className="text-white">Audit Log Retention (days)</Label>
                  <Input
                    type="number"
                    value={settings.auditLogRetention}
                    onChange={(e) => setSettings({ ...settings, auditLogRetention: e.target.value })}
                    className="mt-2 bg-white/5 border-white/10"
                  />
                </div>
              </div>
            </Card>

            {/* Email Configuration */}
            <Card className="bg-white/[0.02] border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                <Mail className="w-5 h-5 text-emerald-400" />
                Email Configuration
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">SMTP Host</Label>
                  <Input
                    value={settings.smtpHost}
                    onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                    className="mt-2 bg-white/5 border-white/10"
                  />
                </div>
                <div>
                  <Label className="text-white">SMTP Port</Label>
                  <Input
                    value={settings.smtpPort}
                    onChange={(e) => setSettings({ ...settings, smtpPort: e.target.value })}
                    className="mt-2 bg-white/5 border-white/10"
                  />
                </div>
              </div>
            </Card>

            {/* API Keys */}
            <Card className="bg-white/[0.02] border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                <Key className="w-5 h-5 text-emerald-400" />
                API Keys
              </h3>

              <div>
                <Label className="text-white">OpenAI API Key</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="password"
                    value={settings.openaiApiKey}
                    onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                    className="bg-white/5 border-white/10"
                  />
                  <Button variant="outline" className="border-white/10" onClick={handleUpdateApiKey} disabled={updatingKey}>
                    {updatingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update'}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Used for AI Companion, AI Twin briefs, and sentiment analysis
                </p>
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
