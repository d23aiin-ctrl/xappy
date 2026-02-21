'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  Building2,
  Users,
  Calendar,
  Globe,
  Plus,
  ChevronRight,
  CheckCircle,
} from 'lucide-react';

const organizations = [
  {
    id: '1',
    name: 'TechFlow Industries',
    domain: 'techflow.io',
    employees: 180,
    departments: 5,
    plan: 'Enterprise',
    status: 'active',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'HealthCare Plus',
    domain: 'healthcareplus.com',
    employees: 320,
    departments: 8,
    plan: 'Enterprise',
    status: 'active',
    createdAt: '2023-11-15',
  },
  {
    id: '3',
    name: 'StartupXYZ',
    domain: 'startupxyz.io',
    employees: 45,
    departments: 3,
    plan: 'Growth',
    status: 'trial',
    createdAt: '2024-01-20',
  },
];

export default function OrganizationsPage() {
  const { toast } = useToast();

  const handleAddOrg = () => {
    toast({
      title: 'Add Organization',
      description: 'Organization creation form coming soon.',
    });
  };

  const planColors: Record<string, string> = {
    Enterprise: 'bg-veil-500/20 text-veil-400 border-veil-500/30',
    Growth: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Starter: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return (
    <main className="min-h-screen bg-[#0a0a12] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-veil-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Building2 className="w-7 h-7 text-veil-400" />
                Organizations
              </h1>
              <p className="text-gray-400 mt-1">Manage corporate accounts</p>
            </div>
            <Button className="bg-veil-600 hover:bg-veil-500" onClick={handleAddOrg}>
              <Plus className="w-4 h-4 mr-2" />
              Add Organization
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-white/[0.02] border-white/10 p-4">
              <p className="text-sm text-gray-400">Total Organizations</p>
              <p className="text-2xl font-bold text-white">{organizations.length}</p>
            </Card>
            <Card className="bg-emerald-500/5 border-emerald-500/20 p-4">
              <p className="text-sm text-gray-400">Total Employees</p>
              <p className="text-2xl font-bold text-emerald-400">
                {organizations.reduce((sum, o) => sum + o.employees, 0)}
              </p>
            </Card>
            <Card className="bg-veil-500/5 border-veil-500/20 p-4">
              <p className="text-sm text-gray-400">Enterprise Plans</p>
              <p className="text-2xl font-bold text-veil-400">
                {organizations.filter((o) => o.plan === 'Enterprise').length}
              </p>
            </Card>
          </div>

          {/* Organizations List */}
          <div className="space-y-4">
            {organizations.map((org, i) => (
              <motion.div
                key={org.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-white/[0.02] border-white/10 p-6 hover:bg-white/[0.04] transition-all cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-veil-500/10 border border-veil-500/20 flex items-center justify-center">
                        <Building2 className="w-7 h-7 text-veil-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-white">{org.name}</h3>
                          <Badge className={planColors[org.plan]}>{org.plan}</Badge>
                          {org.status === 'active' && (
                            <Badge className="bg-emerald-500/20 text-emerald-400">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          )}
                          {org.status === 'trial' && (
                            <Badge className="bg-amber-500/20 text-amber-400">Trial</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Globe className="w-3.5 h-3.5" />
                            {org.domain}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {org.employees} employees
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" />
                            {org.departments} departments
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Since {org.createdAt}
                          </span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
