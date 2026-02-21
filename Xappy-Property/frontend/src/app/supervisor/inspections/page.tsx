"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Search, MapPin, User, Clock, ClipboardCheck, CheckCircle, AlertCircle, Eye } from "lucide-react";
import { ReportDetailDialog } from "@/components/reports/ReportDetailDialog";

interface Inspection {
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

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const fetchInspections = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        "/api/v1/reports?report_type=inspection",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setInspections(data.items || []);
    } catch (error) {
      console.error("Error fetching inspections:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, []);

  const handleAcknowledge = async (reportId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      await apiFetch(`/api/v1/reports/${reportId}/acknowledge`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      fetchInspections();
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
          <h1 className="text-2xl font-bold text-gray-900">Walkdown & Inspections</h1>
          <p className="text-gray-600 mt-1">Field inspection logs, defects, and observations</p>
        </div>
        <div className="flex items-center space-x-2 bg-indigo-50 px-4 py-2 rounded-lg">
          <ClipboardCheck className="h-5 w-5 text-indigo-600" />
          <span className="text-indigo-800 font-medium">{inspections.length} inspections</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Inspections</p>
              <p className="text-2xl font-bold text-gray-900">{inspections.length}</p>
            </div>
            <Eye className="h-8 w-8 text-gray-200" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">
                {inspections.filter(r => r.status === "submitted").length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-200" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Acknowledged</p>
              <p className="text-2xl font-bold text-blue-600">
                {inspections.filter(r => r.status === "acknowledged").length}
              </p>
            </div>
            <ClipboardCheck className="h-8 w-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {inspections.filter(r => r.status === "closed").length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-200" />
          </div>
        </div>
      </div>

      {inspections.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No inspections found</h3>
          <p className="text-gray-500 mt-2">Walkdown and inspection logs will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {inspections.map((inspection) => (
            <div
              key={inspection.id}
              className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition cursor-pointer"
              onClick={() => setSelectedReportId(inspection.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <ClipboardCheck className="h-4 w-4 text-indigo-600" />
                    </div>
                    <span className="text-sm font-mono text-gray-500">
                      {inspection.reference_number}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(inspection.status)}`}>
                      {inspection.status.replace("_", " ")}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{inspection.title}</h3>
                  <p className="text-gray-600 mt-2 line-clamp-2">{inspection.description}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedReportId(inspection.id);
                  }}
                  className="p-2 text-gray-400 hover:text-indigo-600 transition"
                  title="View Details"
                >
                  <Eye className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {inspection.reporter_name || "Unknown"}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {inspection.location_description || inspection.site_name || "Unknown"}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(inspection.reported_at).toLocaleString()}
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
