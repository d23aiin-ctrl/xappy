'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  FileText,
  Search,
  Filter,
  User,
  Shield,
  Download,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Loader2,
} from 'lucide-react';

const auditLogs = [
  { id: '1', actor: 'admin@cerebro.app', action: 'USER_ROLE_CHANGED', resource: 'user', resourceId: 'usr_123', timestamp: '2024-01-25 14:32:05', severity: 'warning' },
  { id: '2', actor: 'therapist@cerebro.app', action: 'CASE_BRIEF_GENERATED', resource: 'escalation', resourceId: 'esc_456', timestamp: '2024-01-25 14:28:12', severity: 'info' },
  { id: '3', actor: 'hr@techflow.io', action: 'REPORT_EXPORTED', resource: 'report', resourceId: 'rpt_789', timestamp: '2024-01-25 13:45:00', severity: 'info' },
  { id: '4', actor: 'admin@cerebro.app', action: 'USER_SUSPENDED', resource: 'user', resourceId: 'usr_999', timestamp: '2024-01-25 12:15:30', severity: 'critical' },
  { id: '5', actor: 'system', action: 'ESCALATION_TRIGGERED', resource: 'escalation', resourceId: 'esc_111', timestamp: '2024-01-25 11:02:45', severity: 'warning' },
  { id: '6', actor: 'therapist@cerebro.app', action: 'CONSENT_GRANTED', resource: 'consent', resourceId: 'cns_222', timestamp: '2024-01-25 10:30:00', severity: 'info' },
];

export default function AuditLogsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [exporting, setExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast({
        title: 'Export started',
        description: 'Your audit logs are being prepared for download.',
      });
    } finally {
      setExporting(false);
    }
  };

  const severityConfig = {
    info: { color: 'bg-cyan-500/20 text-cyan-400', icon: Eye },
    warning: { color: 'bg-amber-500/20 text-amber-400', icon: AlertTriangle },
    critical: { color: 'bg-red-500/20 text-red-400', icon: Shield },
  };

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#0a0a12] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/3 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <FileText className="w-7 h-7 text-cyan-400" />
                Audit Logs
              </h1>
              <p className="text-gray-400 mt-1">Track all system activities and changes</p>
            </div>
            <Button variant="outline" className="border-white/10" onClick={handleExport} disabled={exporting}>
              {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              {exporting ? 'Exporting...' : 'Export Logs'}
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search by actor or action..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white/5 border-white/10"
              />
            </div>
            <Button
              variant="outline"
              className={`border-white/10 ${showFilters ? 'bg-white/10' : ''}`}
              onClick={() => {
                setShowFilters(!showFilters);
                toast({
                  title: showFilters ? 'Filters hidden' : 'Filters shown',
                  description: 'Filter options are coming soon.',
                });
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Logs List */}
          <Card className="bg-white/[0.02] border-white/10">
            <div className="divide-y divide-white/5">
              {filteredLogs.map((log, i) => {
                const config = severityConfig[log.severity as keyof typeof severityConfig];
                const Icon = config.icon;

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-white">{log.action}</span>
                            <Badge variant="outline" className="text-xs text-gray-400">
                              {log.resource}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {log.actor}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {log.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <code className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">
                          {log.resourceId}
                        </code>
                        <Badge className={config.color}>{log.severity}</Badge>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
