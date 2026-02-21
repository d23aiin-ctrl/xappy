"use client";

import { useEffect, useState } from "react";
import {
  Home,
  TrendingUp,
  Shield,
  Receipt,
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowUpRight,
  Calendar,
} from "lucide-react";

interface DashboardStats {
  total_properties: number;
  properties_let: number;
  properties_vacant: number;
  monthly_income: number;
  compliance_issues: number;
  maintenance_pending: number;
}

export default function LandlordDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    total_properties: 0,
    properties_let: 0,
    properties_vacant: 0,
    monthly_income: 0,
    compliance_issues: 0,
    maintenance_pending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated data
    setTimeout(() => {
      setStats({
        total_properties: 5,
        properties_let: 4,
        properties_vacant: 1,
        monthly_income: 6450,
        compliance_issues: 2,
        maintenance_pending: 1,
      });
      setLoading(false);
    }, 500);
  }, []);

  const upcomingComplianceDates = [
    { type: "Gas Safety Certificate", property: "Flat 5, Riverside Court", expiry: "2024-02-28", status: "expiring" },
    { type: "Electrical EICR", property: "23 Victoria Gardens", expiry: "2024-03-15", status: "valid" },
    { type: "EPC", property: "15 Park Lane", expiry: "2024-01-15", status: "expired" },
  ];

  const recentActivity = [
    { type: "maintenance", description: "Boiler repair completed", property: "Flat 5, Riverside Court", date: "2024-01-28" },
    { type: "payment", description: "Rent received", property: "23 Victoria Gardens", date: "2024-01-15" },
    { type: "compliance", description: "Gas safety certificate renewed", property: "15 Park Lane", date: "2024-01-10" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
        <p className="text-emerald-100">
          Here's an overview of your property portfolio
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Properties</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_properties}</p>
              <p className="text-sm text-gray-500 mt-1">
                {stats.properties_let} let, {stats.properties_vacant} vacant
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <Home className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Monthly Income</p>
              <p className="text-2xl font-bold text-gray-900">£{stats.monthly_income.toLocaleString()}</p>
              <div className="flex items-center mt-1 text-sm text-green-600">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                All rents collected
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Compliance Alerts</p>
              <p className="text-2xl font-bold text-amber-600">{stats.compliance_issues}</p>
              <p className="text-sm text-amber-600 mt-1">
                Require attention
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <Shield className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.maintenance_pending}</p>
              <p className="text-sm text-gray-500 mt-1">
                Maintenance costs
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Receipt className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Alerts */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Compliance</h2>
            <a href="/landlord/compliance" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              View All →
            </a>
          </div>
          <div className="space-y-3">
            {upcomingComplianceDates.map((item, idx) => (
              <div key={idx} className={`p-3 rounded-lg ${
                item.status === "expired" ? "bg-red-50" :
                item.status === "expiring" ? "bg-amber-50" : "bg-gray-50"
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{item.type}</p>
                    <p className="text-sm text-gray-500">{item.property}</p>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center text-sm font-medium ${
                      item.status === "expired" ? "text-red-600" :
                      item.status === "expiring" ? "text-amber-600" : "text-green-600"
                    }`}>
                      {item.status === "expired" ? (
                        <AlertTriangle className="h-4 w-4 mr-1" />
                      ) : item.status === "expiring" ? (
                        <Clock className="h-4 w-4 mr-1" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-1" />
                      )}
                      {item.status === "expired" ? "Expired" : item.status === "expiring" ? "Expiring Soon" : "Valid"}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(item.expiry).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="space-y-4">
            {recentActivity.map((item, idx) => (
              <div key={idx} className="flex items-start">
                <div className={`p-2 rounded-lg mr-3 ${
                  item.type === "maintenance" ? "bg-orange-100" :
                  item.type === "payment" ? "bg-green-100" : "bg-blue-100"
                }`}>
                  {item.type === "maintenance" ? (
                    <Receipt className="h-4 w-4 text-orange-600" />
                  ) : item.type === "payment" ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <Shield className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.description}</p>
                  <p className="text-sm text-gray-500">{item.property}</p>
                </div>
                <div className="flex items-center text-xs text-gray-400">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(item.date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Properties Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Properties</h2>
          <a href="/landlord/properties" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            View All →
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-emerald-50 rounded-lg">
            <p className="text-3xl font-bold text-emerald-600">{stats.properties_let}</p>
            <p className="text-sm text-gray-600 mt-1">Currently Let</p>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-lg">
            <p className="text-3xl font-bold text-amber-600">{stats.properties_vacant}</p>
            <p className="text-sm text-gray-600 mt-1">Vacant</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-gray-900">{stats.total_properties}</p>
            <p className="text-sm text-gray-600 mt-1">Total Properties</p>
          </div>
        </div>
      </div>
    </div>
  );
}
