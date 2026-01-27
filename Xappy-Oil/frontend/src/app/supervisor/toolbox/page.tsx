"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Search, Eye, X, Users, Clock } from "lucide-react";

interface ToolboxTalkReport {
  id: string;
  reference_number: string;
  title: string;
  description: string;
  status: string;
  reported_at: string;
  reporter?: { full_name: string };
  details?: {
    topic: string;
    topic_category?: string;
    duration_minutes: number;
    attendees_count: number;
    attendance_photo_url?: string;
    key_points_discussed?: string[];
    hazards_discussed?: string[];
    safety_reminders?: string[];
    questions_raised?: string[];
    action_items?: string[];
  };
}

export default function ToolboxTalksPage() {
  const [reports, setReports] = useState<ToolboxTalkReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<ToolboxTalkReport | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const params = new URLSearchParams();
      params.append("report_type", "toolbox_talk");

      const response = await fetch(`/api/v1/reports?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch toolbox talks");

      const data = await response.json();
      setReports(data.items || data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
      report.reference_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.details?.topic?.toLowerCase().includes(searchQuery.toLowerCase())
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
        <h2 className="text-2xl font-bold text-gray-900">Toolbox Talks</h2>
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
            placeholder="Search toolbox talks by topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xappy-primary"
          />
        </div>
      </div>

      {/* Toolbox Talks Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No toolbox talks found
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition cursor-pointer"
              onClick={() => setSelectedReport(report)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <ClipboardList className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-500">
                    {report.reference_number}
                  </span>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                    report.status
                  )}`}
                >
                  {report.status}
                </span>
              </div>

              <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                {report.details?.topic || report.title}
              </h3>

              {report.details?.topic_category && (
                <p className="text-sm text-gray-500 mb-3">
                  Category: {report.details.topic_category}
                </p>
              )}

              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {report.details?.attendees_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {report.details?.duration_minutes || 0} min
                  </span>
                </div>
                <span>{new Date(report.reported_at).toLocaleDateString()}</span>
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
                  <ClipboardList className="h-5 w-5 text-green-600" />
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
                <div>
                  <label className="text-sm font-medium text-gray-500">Topic</label>
                  <p className="text-gray-900 text-lg font-medium">
                    {selectedReport.details?.topic || selectedReport.title}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Category
                    </label>
                    <p className="text-gray-900">
                      {selectedReport.details?.topic_category || "General"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Attendees
                    </label>
                    <p className="text-gray-900">
                      {selectedReport.details?.attendees_count || 0}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Duration
                    </label>
                    <p className="text-gray-900">
                      {selectedReport.details?.duration_minutes || 0} minutes
                    </p>
                  </div>
                </div>

                {selectedReport.details?.attendance_photo_url && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Attendance Photo
                    </label>
                    <div className="mt-2 rounded-lg overflow-hidden bg-gray-100 h-48 flex items-center justify-center">
                      <span className="text-gray-400">Photo available</span>
                    </div>
                  </div>
                )}

                {selectedReport.details?.key_points_discussed &&
                  selectedReport.details.key_points_discussed.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Key Points Discussed
                      </label>
                      <ul className="mt-1 list-disc list-inside text-gray-900">
                        {selectedReport.details.key_points_discussed.map(
                          (point, idx) => (
                            <li key={idx}>{point}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {selectedReport.details?.hazards_discussed &&
                  selectedReport.details.hazards_discussed.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Hazards Discussed
                      </label>
                      <ul className="mt-1 list-disc list-inside text-orange-600">
                        {selectedReport.details.hazards_discussed.map(
                          (hazard, idx) => (
                            <li key={idx}>{hazard}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {selectedReport.details?.safety_reminders &&
                  selectedReport.details.safety_reminders.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Safety Reminders
                      </label>
                      <ul className="mt-1 list-disc list-inside text-blue-600">
                        {selectedReport.details.safety_reminders.map(
                          (reminder, idx) => (
                            <li key={idx}>{reminder}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {selectedReport.details?.questions_raised &&
                  selectedReport.details.questions_raised.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Questions Raised
                      </label>
                      <ul className="mt-1 list-disc list-inside text-gray-900">
                        {selectedReport.details.questions_raised.map((q, idx) => (
                          <li key={idx}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                {selectedReport.details?.action_items &&
                  selectedReport.details.action_items.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Action Items
                      </label>
                      <ul className="mt-1 list-disc list-inside text-gray-900">
                        {selectedReport.details.action_items.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Presenter
                    </label>
                    <p className="text-gray-900">
                      {selectedReport.reporter?.full_name || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Date & Time
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
