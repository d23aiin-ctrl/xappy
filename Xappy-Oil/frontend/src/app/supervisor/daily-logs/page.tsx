"use client";

import { useEffect, useState } from "react";
import { Calendar, MapPin, User, Clock, FileText, CheckCircle, Eye } from "lucide-react";
import { ReportDetailDialog } from "@/components/reports/ReportDetailDialog";

interface DailyLog {
  id: string;
  reference_number: string;
  title: string;
  description: string;
  status: string;
  reported_at: string;
  reporter_name: string | null;
  site_name: string | null;
}

export default function DailyLogsPage() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        "/api/v1/reports?report_type=daily_safety_log",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setLogs(data.items || []);
    } catch (error) {
      console.error("Error fetching daily logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: "bg-yellow-100 text-yellow-800",
      acknowledged: "bg-blue-100 text-blue-800",
      closed: "bg-green-100 text-green-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const handleAcknowledge = async (reportId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      await fetch(`/api/v1/reports/${reportId}/acknowledge`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      fetchLogs();
    } catch (err) {
      console.error("Failed to acknowledge:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-xappy-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Safety Logs</h1>
          <p className="text-gray-600 mt-1">Daily safety observations and status reports</p>
        </div>
        <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
          <Calendar className="h-5 w-5 text-blue-600" />
          <span className="text-blue-800 font-medium">{logs.length} logs</span>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No daily logs found</h3>
          <p className="text-gray-500 mt-2">Daily safety logs will appear here when submitted.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition cursor-pointer"
              onClick={() => setSelectedReportId(log.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-sm font-mono text-gray-500">
                      {log.reference_number}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{log.title}</h3>
                  <p className="text-gray-600 mt-2 line-clamp-2">{log.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedReportId(log.id);
                    }}
                    className="p-2 text-gray-400 hover:text-xappy-primary transition"
                    title="View Details"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <FileText className="h-10 w-10 text-blue-100 flex-shrink-0" />
                </div>
              </div>
              <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {log.reporter_name || "Unknown"}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {log.site_name || "Unknown Site"}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(log.reported_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Detail Dialog */}
      <ReportDetailDialog
        reportId={selectedReportId}
        onClose={() => setSelectedReportId(null)}
        onAcknowledge={handleAcknowledge}
      />
    </div>
  );
}
