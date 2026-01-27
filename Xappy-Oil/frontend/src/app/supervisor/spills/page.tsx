"use client";

import { useEffect, useState } from "react";
import { Droplets, MapPin, User, Clock, AlertTriangle, CheckCircle, Beaker, Eye } from "lucide-react";
import { ReportDetailDialog } from "@/components/reports/ReportDetailDialog";

interface SpillReport {
  id: string;
  reference_number: string;
  title: string;
  description: string;
  status: string;
  reported_at: string;
  reporter_name: string | null;
  site_name: string | null;
  location_description: string | null;
}

export default function SpillReportsPage() {
  const [reports, setReports] = useState<SpillReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        "/api/v1/reports?report_type=spill_report",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setReports(data.items || []);
    } catch (error) {
      console.error("Error fetching spill reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

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
      fetchReports();
    } catch (err) {
      console.error("Failed to acknowledge:", err);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: "bg-red-100 text-red-800",
      acknowledged: "bg-yellow-100 text-yellow-800",
      under_review: "bg-orange-100 text-orange-800",
      closed: "bg-green-100 text-green-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
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
          <h1 className="text-2xl font-bold text-gray-900">Environmental Spill Reports</h1>
          <p className="text-gray-600 mt-1">Spill incident documentation and containment records</p>
        </div>
        <div className="flex items-center space-x-2 bg-cyan-50 px-4 py-2 rounded-lg">
          <Droplets className="h-5 w-5 text-cyan-600" />
          <span className="text-cyan-800 font-medium">{reports.length} reports</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Spills</p>
              <p className="text-2xl font-bold text-red-600">
                {reports.filter(r => r.status !== "closed").length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-200" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Contained</p>
              <p className="text-2xl font-bold text-green-600">
                {reports.filter(r => r.status === "closed").length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-200" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total This Month</p>
              <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
            </div>
            <Beaker className="h-8 w-8 text-gray-200" />
          </div>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <Droplets className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No spill reports found</h3>
          <p className="text-gray-500 mt-2">Environmental spill reports will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition cursor-pointer"
              onClick={() => setSelectedReportId(report.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-cyan-100 rounded-lg">
                      <Droplets className="h-4 w-4 text-cyan-600" />
                    </div>
                    <span className="text-sm font-mono text-gray-500">
                      {report.reference_number}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status.replace("_", " ")}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                  <p className="text-gray-600 mt-2 line-clamp-2">{report.description}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedReportId(report.id);
                  }}
                  className="p-2 text-gray-400 hover:text-cyan-600 transition"
                  title="View Details"
                >
                  <Eye className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {report.reporter_name || "Unknown"}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {report.location_description || report.site_name || "Unknown"}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(report.reported_at).toLocaleString()}
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
