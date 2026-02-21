'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import {
  UserCog,
  Shield,
  Eye,
  Edit,
  Trash,
  Users,
  Building2,
  FileText,
  Brain,
  Save,
  Loader2,
} from 'lucide-react';

const roles = [
  { id: 'INDIVIDUAL', name: 'Individual User', description: 'End users seeking wellness support', color: 'emerald' },
  { id: 'THERAPIST', name: 'Therapist', description: 'Licensed mental health professionals', color: 'cyan' },
  { id: 'HR', name: 'HR Manager', description: 'Corporate wellness administrators', color: 'amber' },
  { id: 'ADMIN', name: 'Admin', description: 'Platform administrators', color: 'veil' },
];

const permissions = [
  { id: 'view_own_data', name: 'View Own Data', category: 'Data Access' },
  { id: 'edit_own_data', name: 'Edit Own Data', category: 'Data Access' },
  { id: 'view_patient_data', name: 'View Patient Data', category: 'Clinical' },
  { id: 'generate_briefs', name: 'Generate AI Briefs', category: 'Clinical' },
  { id: 'view_org_analytics', name: 'View Org Analytics', category: 'Corporate' },
  { id: 'export_reports', name: 'Export Reports', category: 'Corporate' },
  { id: 'manage_users', name: 'Manage Users', category: 'Admin' },
  { id: 'manage_roles', name: 'Manage Roles', category: 'Admin' },
  { id: 'view_audit_logs', name: 'View Audit Logs', category: 'Admin' },
  { id: 'system_settings', name: 'System Settings', category: 'Admin' },
];

const defaultPermissions: Record<string, string[]> = {
  INDIVIDUAL: ['view_own_data', 'edit_own_data'],
  THERAPIST: ['view_own_data', 'edit_own_data', 'view_patient_data', 'generate_briefs'],
  HR: ['view_own_data', 'view_org_analytics', 'export_reports'],
  ADMIN: ['view_own_data', 'edit_own_data', 'view_patient_data', 'generate_briefs', 'view_org_analytics', 'export_reports', 'manage_users', 'manage_roles', 'view_audit_logs', 'system_settings'],
};

export default function PermissionsPage() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [rolePermissions, setRolePermissions] = useState(defaultPermissions);
  const [selectedRole, setSelectedRole] = useState('INDIVIDUAL');

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: 'Permissions saved',
        description: 'Role permissions have been updated successfully.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save permissions.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = (permissionId: string) => {
    const current = rolePermissions[selectedRole];
    const updated = current.includes(permissionId)
      ? current.filter((p) => p !== permissionId)
      : [...current, permissionId];
    setRolePermissions({ ...rolePermissions, [selectedRole]: updated });
  };

  const categories = [...new Set(permissions.map((p) => p.category))];

  return (
    <main className="min-h-screen bg-[#0a0a12] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-veil-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <UserCog className="w-7 h-7 text-veil-400" />
                Permissions
              </h1>
              <p className="text-gray-400 mt-1">Configure role-based access control</p>
            </div>
            <Button className="bg-veil-600 hover:bg-veil-500" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Roles List */}
            <Card className="bg-white/[0.02] border-white/10 p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Roles</h3>
              <div className="space-y-2">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      selectedRole === role.id
                        ? `bg-${role.color}-500/10 border border-${role.color}-500/30`
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{role.name}</p>
                        <p className="text-xs text-gray-500">{role.description}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {rolePermissions[role.id].length}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Permissions Matrix */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="bg-white/[0.02] border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">
                    {roles.find((r) => r.id === selectedRole)?.name} Permissions
                  </h3>
                  <Badge className={`bg-${roles.find((r) => r.id === selectedRole)?.color}-500/20 text-${roles.find((r) => r.id === selectedRole)?.color}-400`}>
                    {rolePermissions[selectedRole].length} active
                  </Badge>
                </div>

                {categories.map((category) => (
                  <div key={category} className="mb-6 last:mb-0">
                    <h4 className="text-sm font-medium text-gray-400 mb-3">{category}</h4>
                    <div className="space-y-3">
                      {permissions
                        .filter((p) => p.category === category)
                        .map((permission) => (
                          <div
                            key={permission.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                rolePermissions[selectedRole].includes(permission.id)
                                  ? 'bg-emerald-500/20'
                                  : 'bg-gray-500/10'
                              }`}>
                                {category === 'Data Access' && <Eye className="w-4 h-4 text-gray-400" />}
                                {category === 'Clinical' && <Brain className="w-4 h-4 text-gray-400" />}
                                {category === 'Corporate' && <Building2 className="w-4 h-4 text-gray-400" />}
                                {category === 'Admin' && <Shield className="w-4 h-4 text-gray-400" />}
                              </div>
                              <span className="text-sm text-white">{permission.name}</span>
                            </div>
                            <Switch
                              checked={rolePermissions[selectedRole].includes(permission.id)}
                              onCheckedChange={() => togglePermission(permission.id)}
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
