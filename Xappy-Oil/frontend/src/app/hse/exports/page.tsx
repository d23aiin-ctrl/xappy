"use client";

import { useState } from "react";
import {
  Download,
  FileText,
  FileSpreadsheet,
  Calendar,
  Building2,
  Filter,
  CheckCircle,
  Clock,
  Shield,
} from "lucide-react";

const reportTypes = [
  { id: "all", name: "All Reports", description: "Complete safety reporting data" },
  { id: "near_miss", name: "Near-Miss Reports", description: "Near-miss incident records" },
  { id: "incident", name: "Incident Reports", description: "Incident initial reports" },
  { id: "toolbox_talk", name: "Toolbox Talks", description: "Toolbox talk evidence" },
  { id: "inspection", name: "Inspections", description: "Walkdown and inspection logs" },
  { id: "spill_report", name: "Spill Reports", description: "Environmental spill records" },
  { id: "ptw_evidence", name: "PTW Evidence", description: "Permit to Work evidence" },
  { id: "loto_evidence", name: "LOTO Evidence", description: "Lockout/Tagout records" },
  { id: "shift_handover", name: "Shift Handovers", description: "Shift handover summaries" },
  { id: "daily_safety_log", name: "Daily Safety Logs", description: "Daily safety observations" },
];

const exportFormats = [
  { id: "pdf", name: "PDF Report", icon: FileText, description: "Formatted audit report" },
  { id: "excel", name: "Excel Spreadsheet", icon: FileSpreadsheet, description: "Raw data export" },
];

export default function HSEExportsPage() {
  const [selectedType, setSelectedType] = useState("all");
  const [selectedFormat, setSelectedFormat] = useState("pdf");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedSite, setSelectedSite] = useState("all");
  const [exporting, setExporting] = useState(false);
  const [exportHistory, setExportHistory] = useState([
    {
      id: "1",
      name: "Near-Miss Report - January 2026",
      type: "near_miss",
      format: "pdf",
      date: "2026-01-02T10:30:00Z",
      status: "completed",
    },
    {
      id: "2",
      name: "All Reports Export",
      type: "all",
      format: "excel",
      date: "2026-01-01T14:15:00Z",
      status: "completed",
    },
  ]);

  const handleExport = async () => {
    setExporting(true);

    // Simulate export
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newExport = {
      id: Date.now().toString(),
      name: `${reportTypes.find(t => t.id === selectedType)?.name} Export`,
      type: selectedType,
      format: selectedFormat,
      date: new Date().toISOString(),
      status: "completed",
    };

    setExportHistory([newExport, ...exportHistory]);
    setExporting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Export Data</h1>
        <p className="text-gray-600 mt-1">
          Generate audit-ready reports and data exports
        </p>
      </div>

      {/* Export Configuration */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Configure Export
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {reportTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              {reportTypes.find(t => t.id === selectedType)?.description}
            </p>
          </div>

          {/* Site Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site
            </label>
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Sites</option>
              <option value="MR-001">Mumbai Refinery</option>
              <option value="JP-002">Jamnagar Processing Plant</option>
              <option value="BH-003">Bombay High Offshore Platform</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Export Format */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Export Format
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exportFormats.map((format) => (
              <button
                key={format.id}
                onClick={() => setSelectedFormat(format.id)}
                className={`flex items-center p-4 border-2 rounded-lg transition ${
                  selectedFormat === format.id
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <format.icon className={`h-8 w-8 mr-3 ${
                  selectedFormat === format.id ? "text-emerald-600" : "text-gray-400"
                }`} />
                <div className="text-left">
                  <p className={`font-medium ${
                    selectedFormat === format.id ? "text-emerald-900" : "text-gray-900"
                  }`}>
                    {format.name}
                  </p>
                  <p className="text-sm text-gray-500">{format.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Export Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate Export
              </>
            )}
          </button>
        </div>
      </div>

      {/* Audit Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h4 className="font-medium text-blue-800">Audit-Ready Exports</h4>
            <p className="text-sm text-blue-700 mt-1">
              All exports include timestamps, reference numbers, and complete audit trails.
              PDF reports are formatted for regulatory compliance submissions.
            </p>
          </div>
        </div>
      </div>

      {/* Export History */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Recent Exports</h3>
        </div>
        <div className="divide-y">
          {exportHistory.map((export_) => (
            <div key={export_.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                {export_.format === "pdf" ? (
                  <FileText className="h-8 w-8 text-red-500 mr-3" />
                ) : (
                  <FileSpreadsheet className="h-8 w-8 text-green-500 mr-3" />
                )}
                <div>
                  <p className="font-medium text-gray-900">{export_.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(export_.date).toLocaleString()} • {export_.format.toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="flex items-center text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Completed
                </span>
                <button className="px-3 py-1 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition">
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
