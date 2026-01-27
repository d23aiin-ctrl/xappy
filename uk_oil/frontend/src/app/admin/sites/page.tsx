"use client";

import { useState } from "react";
import {
  Building2,
  MapPin,
  Users,
  FileText,
  Plus,
  Edit,
  Settings,
  CheckCircle,
} from "lucide-react";

interface Site {
  code: string;
  name: string;
  type: string;
  city: string;
  state: string;
  employee_count: number;
  contractor_count: number;
  reports_count: number;
  status: string;
}

const sites: Site[] = [
  {
    code: "MR-001",
    name: "Mumbai Refinery",
    type: "Refinery",
    city: "Mumbai",
    state: "Maharashtra",
    employee_count: 850,
    contractor_count: 320,
    reports_count: 14,
    status: "active",
  },
  {
    code: "JP-002",
    name: "Jamnagar Processing Plant",
    type: "Processing Plant",
    city: "Jamnagar",
    state: "Gujarat",
    employee_count: 620,
    contractor_count: 180,
    reports_count: 2,
    status: "active",
  },
  {
    code: "BH-003",
    name: "Bombay High Offshore Platform",
    type: "Offshore Platform",
    city: "Offshore",
    state: "Maharashtra",
    employee_count: 120,
    contractor_count: 45,
    reports_count: 1,
    status: "active",
  },
];

export default function AdminSitesPage() {
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  const totalEmployees = sites.reduce((acc, site) => acc + site.employee_count, 0);
  const totalContractors = sites.reduce((acc, site) => acc + site.contractor_count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Management</h1>
          <p className="text-gray-600 mt-1">
            Manage operational sites and facilities
          </p>
        </div>
        <button className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition">
          <Plus className="h-4 w-4 mr-2" />
          Add Site
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Total Sites</p>
          <p className="text-2xl font-bold text-gray-900">{sites.length}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Total Employees</p>
          <p className="text-2xl font-bold text-blue-600">{totalEmployees.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Total Contractors</p>
          <p className="text-2xl font-bold text-purple-600">{totalContractors.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Active Sites</p>
          <p className="text-2xl font-bold text-green-600">
            {sites.filter((s) => s.status === "active").length}
          </p>
        </div>
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sites.map((site) => (
          <div
            key={site.code}
            className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900">{site.name}</h3>
                    <p className="text-sm text-gray-500">{site.code}</p>
                  </div>
                </div>
                <span className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {site.city}, {site.state}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Building2 className="h-4 w-4 mr-2" />
                  {site.type}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-semibold text-gray-900">{site.employee_count}</p>
                  <p className="text-xs text-gray-500">Employees</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{site.contractor_count}</p>
                  <p className="text-xs text-gray-500">Contractors</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{site.reports_count}</p>
                  <p className="text-xs text-gray-500">Reports</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t flex justify-end space-x-2">
              <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded transition">
                <Settings className="h-4 w-4" />
              </button>
              <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded transition">
                <Edit className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
