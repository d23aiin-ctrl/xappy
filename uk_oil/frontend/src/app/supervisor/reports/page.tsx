"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Search,
  Filter,
  ChevronDown,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { ReportDetailDialog } from "@/components/reports/ReportDetailDialog";

interface Report {
  id: string;
  reference_number: string;
  report_type: string;
  title: string;
  status: string;
  reporter?: { full_name: string };
  site?: { name: string };
  reported_at: string;
}

const reportTypes = [
  { value: "", label: "All Types" },
  { value: "near_miss", label: "Near-Miss" },
  { value: "incident", label: "Incident" },
  { value: "daily_safety_log", label: "Daily Log" },
  { value: "shift_handover", label: "Shift Handover" },
  { value: "toolbox_talk", label: "Toolbox Talk" },
  { value: "ptw_evidence", label: "PTW Evidence" },
  { value: "loto_evidence", label: "LOTO Evidence" },
  { value: "spill_report", label: "Spill Report" },
  { value: "inspection", label: "Inspection" },
];

const statuses = [
  { value: "", label: "All Status" },
  { value: "submitted", label: "Submitted" },
  { value: "acknowledged", label: "Acknowledged" },
  { value: "under_review", label: "Under Review" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, [typeFilter, statusFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const params = new URLSearchParams();
      if (typeFilter) params.append("report_type", typeFilter);
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(`/api/v1/reports?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch reports");

      const data = await response.json();
      setReports(data.items || data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (reportId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`/api/v1/reports/${reportId}/acknowledge`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes: "Acknowledged via dashboard" }),
      });

      if (!response.ok) throw new Error("Failed to acknowledge");

      fetchReports();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      submitted: "bg-blue-100 text-blue-800",
      acknowledged: "bg-purple-100 text-purple-800",
      under_review: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-orange-100 text-orange-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  const getTypeIcon = (type: string) => {
    if (type === "incident" || type === "near_miss") {
      return <AlertTriangle className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
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
        <h2 className="text-2xl font-bold text-gray-900">All Reports</h2>
        <button
          onClick={fetchReports}
          className="text-sm text-xappy-primary hover:underline"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xappy-primary focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xappy-primary"
            >
              {reportTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xappy-primary"
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reference
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reporter
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No reports found
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {report.reference_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-sm text-gray-700">
                      {getTypeIcon(report.report_type)}
                      {report.report_type.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {report.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.reporter?.full_name || "Unknown"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                        report.status
                      )}`}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(report.reported_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedReportId(report.id)}
                        className="text-xappy-primary hover:text-blue-700"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {report.status === "submitted" && (
                        <button
                          onClick={() => handleAcknowledge(report.id)}
                          className="text-green-600 hover:text-green-700"
                          title="Acknowledge"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Report Detail Dialog */}
      <ReportDetailDialog
        reportId={selectedReportId}
        onClose={() => setSelectedReportId(null)}
        onAcknowledge={async (id) => {
          await handleAcknowledge(id);
          fetchReports();
        }}
      />
    </div>
  );
}
