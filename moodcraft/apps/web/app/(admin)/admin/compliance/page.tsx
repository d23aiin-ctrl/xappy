'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Lock,
  Eye,
  Database,
} from 'lucide-react';

const complianceItems = [
  { id: '1', name: 'HIPAA Compliance', status: 'compliant', score: 98, lastAudit: '2024-01-15' },
  { id: '2', name: 'GDPR Data Protection', status: 'compliant', score: 100, lastAudit: '2024-01-10' },
  { id: '3', name: 'SOC 2 Type II', status: 'in-progress', score: 85, lastAudit: '2024-01-01' },
  { id: '4', name: 'ISO 27001', status: 'compliant', score: 95, lastAudit: '2024-01-12' },
  { id: '5', name: 'AES-256 Encryption', status: 'compliant', score: 100, lastAudit: '2024-01-20' },
  { id: '6', name: 'k-Anonymity (min 5)', status: 'compliant', score: 100, lastAudit: '2024-01-18' },
];

const securityMetrics = [
  { label: 'Data Encrypted at Rest', value: '100%', icon: Lock },
  { label: 'Data Encrypted in Transit', value: '100%', icon: Shield },
  { label: 'Access Logs Retained', value: '90 days', icon: FileText },
  { label: 'Anonymous Data Only', value: 'Corporate', icon: Eye },
];

export default function CompliancePage() {
  const statusConfig = {
    compliant: { color: 'bg-emerald-500/20 text-emerald-400', icon: CheckCircle },
    'in-progress': { color: 'bg-amber-500/20 text-amber-400', icon: Clock },
    'non-compliant': { color: 'bg-red-500/20 text-red-400', icon: AlertTriangle },
  };

  const overallScore = Math.round(
    complianceItems.reduce((sum, item) => sum + item.score, 0) / complianceItems.length
  );

  return (
    <main className="min-h-screen bg-[#0a0a12] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Shield className="w-7 h-7 text-emerald-400" />
                Compliance & Security
              </h1>
              <p className="text-gray-400 mt-1">Monitor compliance status and security metrics</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Overall Compliance Score</p>
              <p className="text-3xl font-bold text-emerald-400">{overallScore}%</p>
            </div>
          </div>

          {/* Security Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {securityMetrics.map((metric) => (
              <Card key={metric.label} className="bg-white/[0.02] border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <metric.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{metric.value}</p>
                    <p className="text-xs text-gray-500">{metric.label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Compliance Items */}
          <h3 className="text-lg font-semibold text-white mb-4">Compliance Standards</h3>
          <div className="space-y-4">
            {complianceItems.map((item, i) => {
              const config = statusConfig[item.status as keyof typeof statusConfig];
              const Icon = config.icon;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-white/[0.02] border-white/10 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{item.name}</h4>
                          <p className="text-xs text-gray-500">Last audit: {item.lastAudit}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-2xl font-bold ${item.score >= 95 ? 'text-emerald-400' : item.score >= 80 ? 'text-amber-400' : 'text-red-400'}`}>
                          {item.score}%
                        </span>
                        <Badge className={config.color}>{item.status}</Badge>
                      </div>
                    </div>
                    <Progress value={item.score} className="h-2" />
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Data Protection Notice */}
          <Card className="bg-emerald-500/5 border-emerald-500/20 p-4 mt-8">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-emerald-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-white">Data Protection Commitment</h3>
                <p className="text-sm text-gray-400 mt-1">
                  All sensitive data is encrypted using AES-256 at rest and TLS 1.3 in transit.
                  Corporate analytics use k-anonymity (minimum group size of 5) to protect individual privacy.
                  No individual-level data is ever exposed to HR or corporate users.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
