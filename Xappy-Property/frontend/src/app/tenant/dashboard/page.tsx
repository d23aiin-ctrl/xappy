"use client";

import { useEffect, useState } from "react";
import {
  Home,
  FileText,
  Wrench,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  Phone,
  Mail,
} from "lucide-react";

interface TenancyInfo {
  property_address: string;
  rent_amount: number;
  next_rent_due: string;
  tenancy_start: string;
  tenancy_end: string;
  property_manager_name: string;
  property_manager_phone: string;
  property_manager_email: string;
}

interface ApplicationStatus {
  stage: string;
  stage_label: string;
  progress: number;
  next_action?: string;
}

export default function TenantDashboard() {
  const [tenancy, setTenancy] = useState<TenancyInfo | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasActiveTenancy, setHasActiveTenancy] = useState(false);

  useEffect(() => {
    // Simulated data - in real app would fetch based on user
    setTimeout(() => {
      // Simulate a tenant in application process
      setApplicationStatus({
        stage: "documents_submitted",
        stage_label: "Documents Under Review",
        progress: 60,
        next_action: "We're reviewing your documents. You'll hear from us soon.",
      });

      // Or simulate active tenancy
      // setHasActiveTenancy(true);
      // setTenancy({
      //   property_address: "Flat 5, Riverside Court, SW1A 1AA",
      //   rent_amount: 1850,
      //   next_rent_due: "2024-02-01",
      //   tenancy_start: "2024-01-01",
      //   tenancy_end: "2025-01-01",
      //   property_manager_name: "Sarah Property Manager",
      //   property_manager_phone: "020 1234 5678",
      //   property_manager_email: "sarah@xappy.com",
      // });

      setLoading(false);
    }, 500);
  }, []);

  const applicationStages = [
    { key: "enquiry", label: "Enquiry" },
    { key: "viewing", label: "Viewing" },
    { key: "application", label: "Application" },
    { key: "documents", label: "Documents" },
    { key: "referencing", label: "Referencing" },
    { key: "contract", label: "Contract" },
    { key: "complete", label: "Move In" },
  ];

  const recentIssues = [
    { id: "1", title: "Dripping tap in bathroom", status: "in_progress", date: "2024-01-25" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome to your Tenant Portal</h1>
        <p className="text-blue-100">
          {hasActiveTenancy
            ? "Manage your tenancy, report issues, and access documents"
            : "Track your application progress and complete required steps"}
        </p>
      </div>

      {/* Application Progress (if in application process) */}
      {applicationStatus && !hasActiveTenancy && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Progress</h2>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Progress</span>
              <span>{applicationStatus.progress}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{ width: `${applicationStatus.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Stages */}
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {applicationStages.map((stage, idx) => {
              const isComplete = idx < 4; // Simulated
              const isCurrent = idx === 4;
              return (
                <div key={stage.key} className="flex flex-col items-center min-w-[70px]">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                      isComplete
                        ? "bg-green-100 text-green-600"
                        : isCurrent
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : isCurrent ? (
                      <Clock className="h-5 w-5" />
                    ) : (
                      <span className="text-sm">{idx + 1}</span>
                    )}
                  </div>
                  <span className={`text-xs text-center ${isCurrent ? "text-blue-600 font-medium" : "text-gray-500"}`}>
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Current status */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">{applicationStatus.stage_label}</p>
                <p className="text-sm text-blue-700 mt-1">{applicationStatus.next_action}</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/tenant/documents"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <FileText className="h-4 w-4 mr-2" />
              View Documents
            </a>
            <a
              href="/tenant/application"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Application Details
              <ArrowRight className="h-4 w-4 ml-2" />
            </a>
          </div>
        </div>
      )}

      {/* Active Tenancy Info (if has tenancy) */}
      {hasActiveTenancy && tenancy && (
        <>
          {/* Property Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Your Property</h2>
                <p className="text-gray-500">{tenancy.property_address}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Monthly Rent</p>
                <p className="text-xl font-bold text-gray-900">£{tenancy.rent_amount.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg">
                <p className="text-sm text-gray-500">Next Rent Due</p>
                <p className="text-xl font-bold text-amber-600">
                  {new Date(tenancy.next_rent_due).toLocaleDateString()}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Tenancy Ends</p>
                <p className="text-xl font-bold text-gray-900">
                  {new Date(tenancy.tenancy_end).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Property Manager Contact */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Property Manager</h2>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium mr-4">
                {tenancy.property_manager_name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{tenancy.property_manager_name}</p>
                <div className="flex flex-wrap gap-4 mt-1">
                  <a href={`tel:${tenancy.property_manager_phone}`} className="flex items-center text-sm text-gray-500 hover:text-blue-600">
                    <Phone className="h-4 w-4 mr-1" />
                    {tenancy.property_manager_phone}
                  </a>
                  <a href={`mailto:${tenancy.property_manager_email}`} className="flex items-center text-sm text-gray-500 hover:text-blue-600">
                    <Mail className="h-4 w-4 mr-1" />
                    {tenancy.property_manager_email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="/tenant/issues"
          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition">
              <Wrench className="h-6 w-6 text-orange-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-orange-600 transition" />
          </div>
          <h3 className="font-semibold text-gray-900 mt-4">Report an Issue</h3>
          <p className="text-sm text-gray-500 mt-1">Something broken? Let us know</p>
        </a>

        <a
          href="/tenant/documents"
          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-blue-600 transition" />
          </div>
          <h3 className="font-semibold text-gray-900 mt-4">My Documents</h3>
          <p className="text-sm text-gray-500 mt-1">View and upload documents</p>
        </a>

        <a
          href="/tenant/tenancy"
          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition">
              <Home className="h-6 w-6 text-purple-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-purple-600 transition" />
          </div>
          <h3 className="font-semibold text-gray-900 mt-4">Tenancy Details</h3>
          <p className="text-sm text-gray-500 mt-1">View your contract and terms</p>
        </a>
      </div>

      {/* Recent Issues */}
      {recentIssues.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Issues</h2>
            <a href="/tenant/issues" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All →
            </a>
          </div>
          <div className="space-y-3">
            {recentIssues.map((issue) => (
              <div key={issue.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg mr-3">
                    <Wrench className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{issue.title}</p>
                    <p className="text-sm text-gray-500">Reported {new Date(issue.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                  In Progress
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
