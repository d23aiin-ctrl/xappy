'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  BarChart3,
  Download,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  Leaf,
  Loader2,
} from 'lucide-react';

const reports = [
  {
    id: '1',
    name: 'Q4 2024 ESG Wellness Report',
    type: 'ESG',
    generatedAt: '2024-01-15',
    status: 'ready',
    pages: 24,
  },
  {
    id: '2',
    name: 'Monthly Wellness Summary - January',
    type: 'Monthly',
    generatedAt: '2024-01-31',
    status: 'ready',
    pages: 8,
  },
  {
    id: '3',
    name: 'Department Risk Analysis Q4',
    type: 'Risk',
    generatedAt: '2024-01-20',
    status: 'ready',
    pages: 15,
  },
  {
    id: '4',
    name: 'Annual Wellness Trends 2024',
    type: 'Annual',
    generatedAt: 'Generating...',
    status: 'generating',
    pages: 0,
  },
];

export default function ESGReportsPage() {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast({
        title: 'Report generation started',
        description: 'Your ESG report is being generated. This may take a few minutes.',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPDF = async (reportId: string) => {
    setDownloading(reportId);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast({
        title: 'Download started',
        description: 'Your PDF report is being downloaded.',
      });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a12] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-1/3 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <BarChart3 className="w-7 h-7 text-emerald-400" />
                ESG Reports
              </h1>
              <p className="text-gray-400 mt-1">Environmental, Social & Governance wellness reports</p>
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={handleGenerateReport} disabled={generating}>
              {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
              {generating ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>

          {/* ESG Info */}
          <Card className="bg-emerald-500/5 border-emerald-500/20 p-4 mb-8">
            <div className="flex items-start gap-3">
              <Leaf className="w-5 h-5 text-emerald-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-white">ESG Compliance</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Our wellness reports align with ESG frameworks including GRI, SASB, and UN SDG #3 (Good Health and Wellbeing).
                  All data is anonymized and aggregated at department level.
                </p>
              </div>
            </div>
          </Card>

          {/* Report Types */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { type: 'ESG', count: 4, color: 'emerald' },
              { type: 'Monthly', count: 12, color: 'cyan' },
              { type: 'Quarterly', count: 4, color: 'amber' },
              { type: 'Annual', count: 1, color: 'veil' },
            ].map((t) => (
              <Card key={t.type} className={`bg-${t.color}-500/5 border-${t.color}-500/20 p-4`}>
                <p className="text-sm text-gray-400">{t.type} Reports</p>
                <p className={`text-2xl font-bold text-${t.color}-400`}>{t.count}</p>
              </Card>
            ))}
          </div>

          {/* Reports List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Recent Reports</h3>
            {reports.map((report, i) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-white/[0.02] border-white/10 p-5 hover:bg-white/[0.04] transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{report.name}</h4>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <Badge variant="outline" className="text-xs">
                            {report.type}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {report.generatedAt}
                          </span>
                          {report.pages > 0 && (
                            <span>{report.pages} pages</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {report.status === 'ready' ? (
                        <>
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Ready
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/10"
                            onClick={() => handleDownloadPDF(report.id)}
                            disabled={downloading === report.id}
                          >
                            {downloading === report.id ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4 mr-1" />
                            )}
                            PDF
                          </Button>
                        </>
                      ) : (
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                          <Clock className="w-3 h-3 mr-1 animate-spin" />
                          Generating
                        </Badge>
                      )}
                    </div>
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
