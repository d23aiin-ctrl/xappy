"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import {
  X,
  Clock,
  MapPin,
  User,
  Building2,
  AlertTriangle,
  CheckCircle,
  FileText,
  Camera,
  MessageSquare,
} from "lucide-react";

interface ReportDetail {
  id: string;
  reference_number: string;
  report_type: string;
  title: string;
  description: string;
  description_original?: string;
  original_language: string;
  status: string;
  source: string;
  reported_at: string;
  occurred_at: string;
  submitted_at?: string;
  acknowledged_at?: string;
  closed_at?: string;
  reporter_id?: string;
  reporter_name?: string;
  site_id?: string;
  site_name?: string;
  area_id?: string;
  area_name?: string;
  location_description?: string;
  gps_coordinates?: { lat: number; lng: number };
  ai_classification?: Record<string, unknown>;
  ai_summary?: string;
  attachment_count: number;
}

interface ReportDetailDialogProps {
  reportId: string | null;
  onClose: () => void;
  onAcknowledge?: (reportId: string) => Promise<void>;
}

const statusColors: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-800",
  acknowledged: "bg-purple-100 text-purple-800",
  under_investigation: "bg-yellow-100 text-yellow-800",
  corrective_action: "bg-orange-100 text-orange-800",
  closed: "bg-green-100 text-green-800",
};

const reportTypeLabels: Record<string, string> = {
  near_miss: "Near-Miss",
  incident: "Incident",
  toolbox_talk: "Toolbox Talk",
  shift_handover: "Shift Handover",
  ptw_evidence: "PTW Evidence",
  loto_evidence: "LOTO Evidence",
  spill_report: "Spill Report",
  inspection: "Inspection",
  daily_safety_log: "Daily Safety Log",
};

export function ReportDetailDialog({
  reportId,
  onClose,
  onAcknowledge,
}: ReportDetailDialogProps) {
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acknowledging, setAcknowledging] = useState(false);

  useEffect(() => {
    if (reportId) {
      fetchReport(reportId);
    } else {
      setReport(null);
    }
  }, [reportId]);

  const fetchReport = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      const response = await apiFetch(`/api/v1/reports/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch report");
      }

      const data = await response.json();
      setReport(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async () => {
    if (!report || !onAcknowledge) return;
    setAcknowledging(true);
    try {
      await onAcknowledge(report.id);
      // Refresh report data
      await fetchReport(report.id);
    } catch (err) {
      console.error("Failed to acknowledge:", err);
    } finally {
      setAcknowledging(false);
    }
  };

  if (!reportId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden m-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Report Details
            </h2>
            {report && (
              <p className="text-sm text-gray-500 font-mono">
                {report.reference_number}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => reportId && fetchReport(reportId)}
                className="mt-4 text-sm text-blue-600 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : report ? (
            <div className="space-y-6">
              {/* Status & Type */}
              <div className="flex flex-wrap gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[report.status] || "bg-gray-100 text-gray-800"}`}>
                  {report.status.replace(/_/g, " ")}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  {reportTypeLabels[report.report_type] || report.report_type}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                  via {report.source}
                </span>
              </div>

              {/* Title */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {report.title}
                </h3>
              </div>

              {/* Key Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-start space-x-2">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Reported</p>
                    <p className="text-sm font-medium">
                      {new Date(report.reported_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Occurred</p>
                    <p className="text-sm font-medium">
                      {new Date(report.occurred_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Reporter</p>
                    <p className="text-sm font-medium">
                      {report.reporter_name || "Unknown"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Site</p>
                    <p className="text-sm font-medium">
                      {report.site_name || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location */}
              {(report.location_description || report.area_name) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-5 w-5 text-gray-600" />
                    <h4 className="font-medium text-gray-900">Location</h4>
                  </div>
                  {report.area_name && (
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Area:</span> {report.area_name}
                    </p>
                  )}
                  {report.location_description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {report.location_description}
                    </p>
                  )}
                  {report.gps_coordinates && (
                    <p className="text-xs text-gray-500 mt-2 font-mono">
                      GPS: {report.gps_coordinates.lat.toFixed(6)}, {report.gps_coordinates.lng.toFixed(6)}
                    </p>
                  )}
                </div>
              )}

              {/* Description */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <h4 className="font-medium text-gray-900">Description</h4>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {report.description}
                  </p>
                  {report.description_original && report.description_original !== report.description && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">
                        Original ({report.original_language}):
                      </p>
                      <p className="text-gray-600 text-sm italic">
                        {report.description_original}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Summary */}
              {report.ai_summary && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <MessageSquare className="h-5 w-5 text-gray-600" />
                    <h4 className="font-medium text-gray-900">AI Summary</h4>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                      {report.ai_summary}
                    </p>
                  </div>
                </div>
              )}

              {/* Attachments */}
              {report.attachment_count > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Camera className="h-5 w-5 text-gray-600" />
                    <h4 className="font-medium text-gray-900">
                      Attachments ({report.attachment_count})
                    </h4>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500 text-sm">
                    Attachment viewing coming soon
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Timeline</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Submitted</p>
                      <p className="text-xs text-gray-500">
                        {new Date(report.submitted_at || report.reported_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {report.acknowledged_at && (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Acknowledged</p>
                        <p className="text-xs text-gray-500">
                          {new Date(report.acknowledged_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                  {report.closed_at && (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Closed</p>
                        <p className="text-xs text-gray-500">
                          {new Date(report.closed_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        {report && (
          <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t bg-gray-50">
            {report.status === "submitted" && onAcknowledge && (
              <button
                onClick={handleAcknowledge}
                disabled={acknowledging}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
              >
                {acknowledging ? "Acknowledging..." : "Acknowledge"}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
