"use client";

import { useEffect, useState } from "react";
import { FileCheck, MapPin, User, Clock, Shield, CheckCircle, AlertCircle, Eye } from "lucide-react";
import { ReportDetailDialog } from "@/components/reports/ReportDetailDialog";

interface PTWEvidence {
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

export default function PTWEvidencePage() {
  const [records, setRecords] = useState<PTWEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        "/api/v1/reports?report_type=ptw_evidence",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setRecords(data.items || []);
    } catch (error) {
      console.error("Error fetching PTW evidence:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
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
      fetchRecords();
    } catch (err) {
      console.error("Failed to acknowledge:", err);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: "bg-yellow-100 text-yellow-800",
      acknowledged: "bg-blue-100 text-blue-800",
      under_review: "bg-purple-100 text-purple-800",
      closed: "bg-green-100 text-green-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    if (status === "closed") return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (status === "acknowledged") return <Shield className="h-5 w-5 text-blue-500" />;
    return <AlertCircle className="h-5 w-5 text-yellow-500" />;
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
          <h1 className="text-2xl font-bold text-gray-900">PTW Evidence</h1>
          <p className="text-gray-600 mt-1">Permit to Work verification and evidence records</p>
        </div>
        <div className="flex items-center space-x-2 bg-purple-50 px-4 py-2 rounded-lg">
          <FileCheck className="h-5 w-5 text-purple-600" />
          <span className="text-purple-800 font-medium">{records.length} records</span>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start">
          <Shield className="h-5 w-5 text-amber-600 mt-0.5 mr-3" />
          <div>
            <h4 className="font-medium text-amber-800">Evidence Logging Only</h4>
            <p className="text-sm text-amber-700 mt-1">
              This system records PTW evidence (start confirmation, isolation verified, close-out notes).
              It does not issue or approve permits.
            </p>
          </div>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <FileCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No PTW evidence found</h3>
          <p className="text-gray-500 mt-2">PTW verification records will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {records.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition cursor-pointer"
              onClick={() => setSelectedReportId(record.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(record.status)}
                    <span className="text-sm font-mono text-gray-500">
                      {record.reference_number}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      {record.status.replace("_", " ")}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{record.title}</h3>
                  <p className="text-gray-600 mt-2 line-clamp-2">{record.description}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedReportId(record.id);
                  }}
                  className="p-2 text-gray-400 hover:text-purple-600 transition"
                  title="View Details"
                >
                  <Eye className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {record.reporter_name || "Unknown"}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {record.location_description || record.site_name || "Unknown"}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(record.reported_at).toLocaleString()}
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
