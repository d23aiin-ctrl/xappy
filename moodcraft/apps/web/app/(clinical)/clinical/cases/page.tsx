'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ClipboardList,
  Search,
  Filter,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  ChevronRight,
} from 'lucide-react';

interface Case {
  id: string;
  patientId: string;
  patientArchetype: string;
  status: 'ACTIVE' | 'PENDING' | 'RESOLVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assignedAt: string;
  lastActivity: string;
  notes: number;
  riskScore: number;
}

export default function ClinicalCasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'RESOLVED'>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Simulated data - in production, fetch from API
    setCases([
      {
        id: '1',
        patientId: 'P-7829',
        patientArchetype: 'DRIFTER',
        status: 'ACTIVE',
        priority: 'HIGH',
        assignedAt: '2024-01-15',
        lastActivity: '2 hours ago',
        notes: 5,
        riskScore: 72,
      },
      {
        id: '2',
        patientId: 'P-4521',
        patientArchetype: 'SEEKER',
        status: 'ACTIVE',
        priority: 'MEDIUM',
        assignedAt: '2024-01-18',
        lastActivity: '1 day ago',
        notes: 3,
        riskScore: 45,
      },
      {
        id: '3',
        patientId: 'P-9012',
        patientArchetype: 'TRANSFORMER',
        status: 'PENDING',
        priority: 'LOW',
        assignedAt: '2024-01-20',
        lastActivity: '3 days ago',
        notes: 1,
        riskScore: 28,
      },
    ]);
    setLoading(false);
  }, []);

  const filteredCases = cases.filter((c) => {
    if (filter !== 'ALL' && c.status !== filter) return false;
    if (search && !c.patientId.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const priorityColors = {
    LOW: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    MEDIUM: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const statusIcons = {
    ACTIVE: <Clock className="w-4 h-4 text-cyan-400" />,
    PENDING: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    RESOLVED: <CheckCircle className="w-4 h-4 text-emerald-400" />,
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <div className="oracle-spinner" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a12] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <ClipboardList className="w-7 h-7 text-cyan-400" />
                Active Cases
              </h1>
              <p className="text-gray-400 mt-1">Manage your assigned patient cases</p>
            </div>
            <Badge variant="outline" className="text-cyan-400 border-cyan-500/30">
              {cases.filter((c) => c.status === 'ACTIVE').length} Active
            </Badge>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search by patient ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white/5 border-white/10"
              />
            </div>
            <div className="flex gap-2">
              {(['ALL', 'ACTIVE', 'PENDING', 'RESOLVED'] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(f)}
                  className={filter === f ? 'bg-cyan-600' : 'border-white/10'}
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>

          {/* Cases List */}
          <div className="space-y-4">
            {filteredCases.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-white/[0.02] border-white/10 p-5 hover:bg-white/[0.04] transition-all cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                        <User className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-white">{c.patientId}</h3>
                          <Badge variant="outline" className="text-xs">
                            {c.patientArchetype}
                          </Badge>
                          <Badge className={priorityColors[c.priority]}>
                            {c.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            {statusIcons[c.status]}
                            {c.status}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Assigned {c.assignedAt}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            {c.notes} notes
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Risk Score</div>
                        <div className={`text-lg font-bold ${c.riskScore >= 70 ? 'text-red-400' : c.riskScore >= 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {c.riskScore}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}

            {filteredCases.length === 0 && (
              <div className="text-center py-12">
                <ClipboardList className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No cases found</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
