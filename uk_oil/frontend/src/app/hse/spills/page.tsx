"use client";

import { useEffect, useState } from "react";
import {
  Droplets,
  MapPin,
  User,
  Clock,
  AlertTriangle,
  CheckCircle,
  Filter,
  Download,
} from "lucide-react";

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

export default function HSESpillsPage() {
  const [reports, setReports] = useState<SpillReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(
          "http://localhost:8000/api/v1/reports?report_type=spill_report&page_size=100",
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
    fetchReports();
  }, []);

  const filteredReports = filter === "all"
    ? reports
    : reports.filter(r => r.status === filter);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: "bg-red-100 text-red-800 border-red-200",
      acknowledged: "bg-yellow-100 text-yellow-800 border-yellow-200",
      under_review: "bg-orange-100 text-orange-800 border-orange-200",
      closed: "bg-green-100 text-green-800 border-green-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Environmental Spill Reports</h1>
          <p className="text-gray-600 mt-1">
            All environmental spill incidents across sites
          </p>
        </div>
        <button className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Active Spills</p>
              <p className="text-2xl font-bold text-red-700">
                {reports.filter(r => r.status !== "closed").length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-300" />
          </div>
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">Under Review</p>
              <p className="text-2xl font-bold text-yellow-700">
                {reports.filter(r => r.status === "under_review").length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-300" />
          </div>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Contained/Closed</p>
              <p className="text-2xl font-bold text-green-700">
                {reports.filter(r => r.status === "closed").length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-300" />
          </div>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Total This Month</p>
              <p className="text-2xl font-bold text-blue-700">{reports.length}</p>
            </div>
            <Droplets className="h-8 w-8 text-blue-300" />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center space-x-2">
        <Filter className="h-5 w-5 text-gray-400" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Status</option>
          <option value="submitted">Submitted</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="under_review">Under Review</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <Droplets className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No spill reports found</h3>
          <p className="text-gray-500 mt-2">Environmental spill reports will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Reporter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Reported At
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-gray-600">
                      {report.reference_number}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{report.title}</p>
                    <p className="text-sm text-gray-500 truncate max-w-xs">
                      {report.description}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {report.location_description || report.site_name || "Unknown"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-1" />
                      {report.reporter_name || "Unknown"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(report.reported_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                      {report.status.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
