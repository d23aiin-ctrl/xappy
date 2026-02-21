"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  ClipboardList,
  Search,
  Eye,
  X,
  Mic,
  Play,
  Pause,
  CheckCircle,
  Clock,
} from "lucide-react";

interface HandoverReport {
  id: string;
  reference_number: string;
  title: string;
  description: string;
  status: string;
  reported_at: string;
  reporter?: { full_name: string };
  details?: {
    outgoing_shift: string;
    incoming_shift: string;
    voice_recording_url?: string;
    voice_duration_seconds?: number;
    transcription?: string;
    key_activities_completed?: string[];
    pending_tasks?: string[];
    safety_concerns?: string[];
    personnel_on_shift?: number;
    handover_accepted: boolean;
    accepted_at?: string;
  };
}

export default function HandoversPage() {
  const [reports, setReports] = useState<HandoverReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<HandoverReport | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const params = new URLSearchParams();
      params.append("report_type", "shift_handover");

      const response = await apiFetch(`/api/v1/reports?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch handovers");

      const data = await response.json();
      setReports(data.items || data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      submitted: "bg-blue-100 text-blue-800",
      acknowledged: "bg-purple-100 text-purple-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  const filteredReports = reports.filter(
    (report) =>
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reference_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-xappy-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Shift Handovers</h2>
        <button
          onClick={fetchReports}
          className="text-sm text-xappy-primary hover:underline"
        >
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search handovers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xappy-primary"
          />
        </div>
      </div>

      {/* Handovers List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center text-gray-500">
            No shift handovers found
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition cursor-pointer"
              onClick={() => setSelectedReport(report)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <ClipboardList className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-500">
                        {report.reference_number}
                      </span>
                      {report.details?.handover_accepted && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Accepted
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      {report.details?.outgoing_shift} → {report.details?.incoming_shift}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {report.description || report.title}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                      {report.details?.voice_recording_url && (
                        <span className="flex items-center gap-1">
                          <Mic className="h-4 w-4" />
                          Voice ({formatDuration(report.details.voice_duration_seconds)})
                        </span>
                      )}
                      {report.details?.personnel_on_shift && (
                        <span>{report.details.personnel_on_shift} personnel</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                      report.status
                    )}`}
                  >
                    {report.status}
                  </span>
                  <p className="text-sm text-gray-400 mt-2">
                    {new Date(report.reported_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedReport.reference_number}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Outgoing Shift
                    </label>
                    <p className="text-gray-900">
                      {selectedReport.details?.outgoing_shift || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Incoming Shift
                    </label>
                    <p className="text-gray-900">
                      {selectedReport.details?.incoming_shift || "N/A"}
                    </p>
                  </div>
                </div>

                {selectedReport.details?.voice_recording_url && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Voice Recording
                    </label>
                    <div className="mt-2 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <button
                        onClick={() =>
                          setPlayingAudio(
                            playingAudio === selectedReport.id ? null : selectedReport.id
                          )
                        }
                        className="p-2 bg-purple-100 rounded-full hover:bg-purple-200"
                      >
                        {playingAudio === selectedReport.id ? (
                          <Pause className="h-5 w-5 text-purple-600" />
                        ) : (
                          <Play className="h-5 w-5 text-purple-600" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div className="h-2 bg-purple-500 rounded-full w-0"></div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDuration(selectedReport.details.voice_duration_seconds)}
                      </span>
                    </div>
                  </div>
                )}

                {selectedReport.details?.transcription && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Transcription
                    </label>
                    <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">
                      {selectedReport.details.transcription}
                    </p>
                  </div>
                )}

                {selectedReport.details?.key_activities_completed &&
                  selectedReport.details.key_activities_completed.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Key Activities Completed
                      </label>
                      <ul className="mt-1 list-disc list-inside text-gray-900">
                        {selectedReport.details.key_activities_completed.map(
                          (activity, idx) => (
                            <li key={idx}>{activity}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {selectedReport.details?.pending_tasks &&
                  selectedReport.details.pending_tasks.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Pending Tasks
                      </label>
                      <ul className="mt-1 list-disc list-inside text-gray-900">
                        {selectedReport.details.pending_tasks.map((task, idx) => (
                          <li key={idx}>{task}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                {selectedReport.details?.safety_concerns &&
                  selectedReport.details.safety_concerns.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Safety Concerns
                      </label>
                      <ul className="mt-1 list-disc list-inside text-orange-600">
                        {selectedReport.details.safety_concerns.map((concern, idx) => (
                          <li key={idx}>{concern}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Personnel on Shift
                    </label>
                    <p className="text-gray-900">
                      {selectedReport.details?.personnel_on_shift || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Handover Status
                    </label>
                    <p className="text-gray-900">
                      {selectedReport.details?.handover_accepted ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" /> Accepted
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-yellow-600">
                          <Clock className="h-4 w-4" /> Pending Acceptance
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Reporter
                    </label>
                    <p className="text-gray-900">
                      {selectedReport.reporter?.full_name || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Submitted At
                    </label>
                    <p className="text-gray-900">
                      {new Date(selectedReport.reported_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
