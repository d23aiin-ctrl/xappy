"use client";

import { useEffect, useState } from "react";
import {
  Home,
  Users,
  Wrench,
  Shield,
  AlertTriangle,
  Clock,
  TrendingUp,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface DashboardStats {
  total_properties: number;
  properties_available: number;
  properties_let: number;
  occupancy_rate: number;
  open_maintenance_issues: number;
  sla_at_risk: number;
  sla_breached: number;
  compliance_expiring_soon: number;
  compliance_expired: number;
  pipeline_summary: Record<string, number>;
}

const defaultStats: DashboardStats = {
  total_properties: 0,
  properties_available: 0,
  properties_let: 0,
  occupancy_rate: 0,
  open_maintenance_issues: 0,
  sla_at_risk: 0,
  sla_breached: 0,
  compliance_expiring_soon: 0,
  compliance_expired: 0,
  pipeline_summary: {},
};

export default function PropertyManagerOverview() {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated data - replace with actual API call
    setTimeout(() => {
      setStats({
        total_properties: 45,
        properties_available: 8,
        properties_let: 37,
        occupancy_rate: 82.2,
        open_maintenance_issues: 12,
        sla_at_risk: 3,
        sla_breached: 1,
        compliance_expiring_soon: 5,
        compliance_expired: 2,
        pipeline_summary: {
          enquiry: 15,
          viewing_scheduled: 8,
          viewing_completed: 4,
          application_started: 6,
          qualification_pending: 3,
          documents_submitted: 2,
          referencing: 4,
          contract_sent: 1,
        },
      });
      setLoading(false);
    }, 500);
  }, []);

  const statCards = [
    {
      title: "Total Properties",
      value: stats.total_properties,
      icon: Home,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      href: "/property-manager/properties",
    },
    {
      title: "Occupancy Rate",
      value: `${stats.occupancy_rate}%`,
      icon: TrendingUp,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      trend: { value: 2.5, positive: true },
    },
    {
      title: "Pipeline Leads",
      value: Object.values(stats.pipeline_summary).reduce((a, b) => a + b, 0),
      icon: Users,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      href: "/property-manager/tenants",
    },
    {
      title: "Open Maintenance",
      value: stats.open_maintenance_issues,
      icon: Wrench,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      href: "/property-manager/maintenance",
      alert: stats.sla_breached > 0,
    },
  ];

  const pipelineStages = [
    { key: "enquiry", label: "Enquiry", color: "bg-gray-200" },
    { key: "viewing_scheduled", label: "Viewing", color: "bg-blue-200" },
    { key: "application_started", label: "Application", color: "bg-indigo-200" },
    { key: "qualification_pending", label: "Qualification", color: "bg-purple-200" },
    { key: "documents_submitted", label: "Documents", color: "bg-pink-200" },
    { key: "referencing", label: "Referencing", color: "bg-orange-200" },
    { key: "contract_sent", label: "Contract", color: "bg-green-200" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                {stat.trend && (
                  <div className={`flex items-center mt-1 text-sm ${stat.trend.positive ? "text-green-600" : "text-red-600"}`}>
                    {stat.trend.positive ? (
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 mr-1" />
                    )}
                    {stat.trend.value}% vs last month
                  </div>
                )}
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg relative`}>
                <stat.icon className={`h-6 w-6 ${stat.color.replace("bg-", "text-")}`} />
                {stat.alert && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Tenant Pipeline</h2>
          <a href="/property-manager/tenants" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            View Pipeline →
          </a>
        </div>
        <div className="flex items-end space-x-2 h-32">
          {pipelineStages.map((stage) => {
            const count = stats.pipeline_summary[stage.key] || 0;
            const maxCount = Math.max(...Object.values(stats.pipeline_summary), 1);
            const height = count > 0 ? Math.max((count / maxCount) * 100, 20) : 10;
            return (
              <div key={stage.key} className="flex-1 flex flex-col items-center">
                <span className="text-sm font-medium text-gray-900 mb-1">{count}</span>
                <div
                  className={`w-full ${stage.color} rounded-t-lg transition-all`}
                  style={{ height: `${height}%` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2 text-center truncate w-full">
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alerts & Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SLA Alerts */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Maintenance SLA Status</h2>
            <a href="/property-manager/maintenance" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              View All →
            </a>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                <span className="text-sm font-medium text-red-800">SLA Breached</span>
              </div>
              <span className="text-lg font-bold text-red-600">{stats.sla_breached}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-amber-600 mr-3" />
                <span className="text-sm font-medium text-amber-800">At Risk ({"<"}4hrs)</span>
              </div>
              <span className="text-lg font-bold text-amber-600">{stats.sla_at_risk}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-green-800">On Track</span>
              </div>
              <span className="text-lg font-bold text-green-600">
                {stats.open_maintenance_issues - stats.sla_breached - stats.sla_at_risk}
              </span>
            </div>
          </div>
        </div>

        {/* Compliance Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Compliance Status</h2>
            <a href="/property-manager/compliance" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              View All →
            </a>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-red-600 mr-3" />
                <span className="text-sm font-medium text-red-800">Expired</span>
              </div>
              <span className="text-lg font-bold text-red-600">{stats.compliance_expired}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-amber-600 mr-3" />
                <span className="text-sm font-medium text-amber-800">Expiring Soon (30 days)</span>
              </div>
              <span className="text-lg font-bold text-amber-600">{stats.compliance_expiring_soon}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-green-800">Compliant Properties</span>
              </div>
              <span className="text-lg font-bold text-green-600">
                {stats.total_properties - stats.compliance_expired}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Property Portfolio</h2>
          <a href="/property-manager/properties" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            View All →
          </a>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-gray-900">{stats.properties_let}</p>
            <p className="text-sm text-gray-500 mt-1">Let</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{stats.properties_available}</p>
            <p className="text-sm text-gray-500 mt-1">Available</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{stats.total_properties}</p>
            <p className="text-sm text-gray-500 mt-1">Total</p>
          </div>
        </div>
      </div>
    </div>
  );
}
