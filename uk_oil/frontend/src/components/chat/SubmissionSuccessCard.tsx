"use client";

import React from "react";
import { CheckCircle, Eye, Plus, Sparkles } from "lucide-react";
import type { SubmissionResult } from "@/types/chat";

interface SubmissionSuccessCardProps {
  result: SubmissionResult;
  onNewReport: () => void;
  onViewReport?: () => void;
}

export default function SubmissionSuccessCard({
  result,
  onNewReport,
  onViewReport,
}: SubmissionSuccessCardProps) {
  const reportTypeLabel = result.reportType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Success header with gradient */}
      <div className="haptik-success-gradient px-5 py-6 text-center">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>
        <h3 className="font-bold text-white text-xl mb-1">
          Report Submitted!
        </h3>
        <p className="text-sm text-white/80">
          Your {reportTypeLabel} has been recorded
        </p>
      </div>

      {/* Reference number */}
      <div className="p-5">
        <div className="bg-slate-50 rounded-xl p-4 text-center mb-4">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Reference Number
          </span>
          <p className="text-lg font-bold text-haptik-blue mt-1 font-mono">
            {result.referenceNumber}
          </p>
        </div>

        <p className="text-sm text-slate-500 text-center mb-5">
          Your report is now under review by your supervisor.
        </p>

        {/* Action buttons */}
        <div className="flex gap-3">
          {onViewReport && (
            <button
              onClick={onViewReport}
              className="flex-1 inline-flex items-center justify-center gap-2
                px-4 py-3 rounded-xl text-haptik-blue bg-blue-50
                hover:bg-blue-100 text-sm font-medium transition-colors"
            >
              <Eye className="h-4 w-4" />
              View Report
            </button>
          )}
          <button
            onClick={onNewReport}
            className="flex-1 inline-flex items-center justify-center gap-2
              px-4 py-3 rounded-xl text-white haptik-gradient
              hover:opacity-90 text-sm font-medium transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Report
          </button>
        </div>
      </div>
    </div>
  );
}
