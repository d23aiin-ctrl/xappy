"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Building2,
  Shield,
  FileCheck,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

interface SiteCompliance {
  name: string;
  code: string;
  nearMissRate: number;
  incidentRate: number;
  toolboxCompliance: number;
  inspectionRate: number;
  overallScore: number;
  status: "compliant" | "warning" | "critical";
}

export default function HSECompliancePage() {
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState<SiteCompliance[]>([]);

  useEffect(() => {
    // Simulated compliance data based on actual sites
    setTimeout(() => {
      setSites([
        {
          name: "Mumbai Refinery",
          code: "MR-001",
          nearMissRate: 85,
          incidentRate: 2,
          toolboxCompliance: 92,
          inspectionRate: 88,
          overallScore: 89,
          status: "compliant",
        },
        {
          name: "Jamnagar Processing Plant",
          code: "JP-002",
          nearMissRate: 78,
          incidentRate: 5,
          toolboxCompliance: 85,
          inspectionRate: 75,
          overallScore: 76,
          status: "warning",
        },
        {
          name: "Bombay High Offshore Platform",
          code: "BH-003",
          nearMissRate: 92,
          incidentRate: 0,
          toolboxCompliance: 98,
          inspectionRate: 95,
          overallScore: 95,
          status: "compliant",
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const averageScore = Math.round(
    sites.reduce((acc, site) => acc + site.overallScore, 0) / sites.length
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Status</h1>
          <p className="text-gray-600 mt-1">
            Safety compliance tracking by site
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-50 px-4 py-2 rounded-lg">
          <Shield className="h-5 w-5 text-emerald-600" />
          <span className="text-emerald-800 font-medium">
            Overall Score: {averageScore}%
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Sites Monitored</p>
              <p className="text-2xl font-bold text-gray-900">{sites.length}</p>
            </div>
            <Building2 className="h-8 w-8 text-gray-300" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Fully Compliant</p>
              <p className="text-2xl font-bold text-green-600">
                {sites.filter((s) => s.status === "compliant").length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-300" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Needs Attention</p>
              <p className="text-2xl font-bold text-yellow-600">
                {sites.filter((s) => s.status === "warning").length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-300" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Critical</p>
              <p className="text-2xl font-bold text-red-600">
                {sites.filter((s) => s.status === "critical").length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-300" />
          </div>
        </div>
      </div>

      {/* Site Compliance Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">
            Site-by-Site Compliance
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Site
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Near-Miss Rate
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Incident Rate
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Toolbox Compliance
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Inspection Rate
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Overall Score
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sites.map((site) => (
                <tr key={site.code} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{site.name}</p>
                        <p className="text-sm text-gray-500">{site.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-medium ${getScoreColor(site.nearMissRate)}`}>
                      {site.nearMissRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-medium ${site.incidentRate > 3 ? "text-red-600" : "text-green-600"}`}>
                      {site.incidentRate}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-medium ${getScoreColor(site.toolboxCompliance)}`}>
                      {site.toolboxCompliance}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-medium ${getScoreColor(site.inspectionRate)}`}>
                      {site.inspectionRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-lg font-bold ${getScoreColor(site.overallScore)}`}>
                      {site.overallScore}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      {getStatusIcon(site.status)}
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(site.status)}`}>
                        {site.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Metrics Legend */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Compliance Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-blue-700">
          <div>
            <strong>Near-Miss Rate:</strong> % of near-miss reports submitted vs expected
          </div>
          <div>
            <strong>Incident Rate:</strong> Number of incidents this month
          </div>
          <div>
            <strong>Toolbox Compliance:</strong> % of required toolbox talks completed
          </div>
          <div>
            <strong>Inspection Rate:</strong> % of scheduled inspections completed
          </div>
        </div>
      </div>
    </div>
  );
}
