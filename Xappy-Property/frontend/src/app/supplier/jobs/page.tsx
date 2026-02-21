"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  Navigation,
  Camera,
  Send,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import type { JobStatus } from "@/types";

interface Job {
  id: string;
  reference: string;
  title: string;
  category: string;
  priority: string;
  status: JobStatus;
  property_address: string;
  property_postcode: string;
  tenant_name: string;
  tenant_phone: string;
  scheduled_date?: string;
  scheduled_time_slot?: string;
  issue_description: string;
  access_instructions?: string;
  is_emergency: boolean;
  estimated_duration?: string;
}

const statusLabels: Record<JobStatus, { label: string; color: string }> = {
  created: { label: "New", color: "bg-gray-100 text-gray-700" },
  sent_to_supplier: { label: "Pending Response", color: "bg-amber-100 text-amber-700" },
  accepted: { label: "Accepted", color: "bg-blue-100 text-blue-700" },
  declined: { label: "Declined", color: "bg-red-100 text-red-700" },
  scheduled: { label: "Scheduled", color: "bg-purple-100 text-purple-700" },
  en_route: { label: "En Route", color: "bg-cyan-100 text-cyan-700" },
  arrived: { label: "On Site", color: "bg-teal-100 text-teal-700" },
  in_progress: { label: "In Progress", color: "bg-orange-100 text-orange-700" },
  parts_required: { label: "Parts Required", color: "bg-yellow-100 text-yellow-700" },
  completed: { label: "Completed", color: "bg-green-100 text-green-700" },
  verified: { label: "Verified", color: "bg-green-100 text-green-700" },
  invoiced: { label: "Invoiced", color: "bg-indigo-100 text-indigo-700" },
  paid: { label: "Paid", color: "bg-emerald-100 text-emerald-700" },
  disputed: { label: "Disputed", color: "bg-red-100 text-red-700" },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-500" },
};

const mockJobs: Job[] = [
  {
    id: "1",
    reference: "JOB-001",
    title: "Boiler repair - no heating",
    category: "Heating",
    priority: "critical",
    status: "sent_to_supplier",
    property_address: "Flat 5, Riverside Court",
    property_postcode: "SW1A 1AA",
    tenant_name: "John Smith",
    tenant_phone: "07700 900123",
    issue_description: "Boiler is not firing up. No heating or hot water since yesterday morning.",
    access_instructions: "Ring buzzer 5, tenant will be home",
    is_emergency: true,
    estimated_duration: "2-3 hours",
  },
  {
    id: "2",
    reference: "JOB-002",
    title: "Leaking tap in kitchen",
    category: "Plumbing",
    priority: "medium",
    status: "scheduled",
    property_address: "23 Victoria Gardens",
    property_postcode: "M1 2AB",
    tenant_name: "Sarah Johnson",
    tenant_phone: "07700 900456",
    scheduled_date: "2024-01-30",
    scheduled_time_slot: "09:00 - 12:00",
    issue_description: "Kitchen mixer tap is dripping constantly. Washer may need replacing.",
    is_emergency: false,
    estimated_duration: "30 mins - 1 hour",
  },
  {
    id: "3",
    reference: "JOB-003",
    title: "Replace window lock",
    category: "Security",
    priority: "high",
    status: "in_progress",
    property_address: "15 Park Lane",
    property_postcode: "B1 3CD",
    tenant_name: "Emma Brown",
    tenant_phone: "07700 900789",
    issue_description: "Window lock broken on ground floor bedroom window. Security concern.",
    is_emergency: false,
    estimated_duration: "1-2 hours",
  },
];

export default function SupplierJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("active");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setJobs(mockJobs);
      setLoading(false);
    }, 500);
  }, []);

  const filteredJobs = jobs.filter((job) => {
    if (filter === "active") {
      return !["completed", "verified", "invoiced", "paid", "cancelled", "declined"].includes(job.status);
    }
    if (filter === "pending") {
      return job.status === "sent_to_supplier";
    }
    if (filter === "completed") {
      return ["completed", "verified", "invoiced", "paid"].includes(job.status);
    }
    return true;
  });

  const handleAcceptJob = (jobId: string) => {
    setJobs(jobs.map(j => j.id === jobId ? { ...j, status: "accepted" as JobStatus } : j));
  };

  const handleDeclineJob = (jobId: string) => {
    setJobs(jobs.map(j => j.id === jobId ? { ...j, status: "declined" as JobStatus } : j));
  };

  const handleUpdateStatus = (jobId: string, newStatus: JobStatus) => {
    setJobs(jobs.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
  };

  const stats = {
    pending: jobs.filter(j => j.status === "sent_to_supplier").length,
    scheduled: jobs.filter(j => ["accepted", "scheduled"].includes(j.status)).length,
    inProgress: jobs.filter(j => ["en_route", "arrived", "in_progress"].includes(j.status)).length,
    completedThisMonth: jobs.filter(j => ["completed", "verified", "invoiced", "paid"].includes(j.status)).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Awaiting Response</p>
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Scheduled</p>
              <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-orange-600">{stats.inProgress}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Briefcase className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed (Month)</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedThisMonth}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {[
          { key: "active", label: "Active Jobs" },
          { key: "pending", label: "Awaiting Response" },
          { key: "completed", label: "Completed" },
          { key: "all", label: "All" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              filter === tab.key
                ? "bg-orange-100 text-orange-700"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-500">No jobs match your current filter.</p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className={`bg-white rounded-xl border ${job.is_emergency ? "border-red-300" : "border-gray-200"} p-5`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-500">{job.reference}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusLabels[job.status].color}`}>
                      {statusLabels[job.status].label}
                    </span>
                    {job.is_emergency && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                        Emergency
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900">{job.title}</h3>
                  <p className="text-sm text-gray-500">{job.category}</p>
                </div>
                {job.scheduled_date && (
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Scheduled</p>
                    <p className="font-medium text-gray-900">
                      {new Date(job.scheduled_date).toLocaleDateString()}
                    </p>
                    {job.scheduled_time_slot && (
                      <p className="text-sm text-gray-500">{job.scheduled_time_slot}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Location & Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{job.property_address}</p>
                    <p className="text-sm text-gray-500">{job.property_postcode}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{job.tenant_name}</p>
                    <a href={`tel:${job.tenant_phone}`} className="text-sm text-blue-600 hover:underline">
                      {job.tenant_phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-700">{job.issue_description}</p>
                {job.access_instructions && (
                  <p className="text-sm text-gray-500 mt-2">
                    <strong>Access:</strong> {job.access_instructions}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                {job.status === "sent_to_supplier" && (
                  <>
                    <button
                      onClick={() => handleAcceptJob(job.id)}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept Job
                    </button>
                    <button
                      onClick={() => handleDeclineJob(job.id)}
                      className="inline-flex items-center px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition font-medium"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Decline
                    </button>
                  </>
                )}

                {job.status === "accepted" && (
                  <button
                    onClick={() => handleUpdateStatus(job.id, "scheduled")}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Visit
                  </button>
                )}

                {job.status === "scheduled" && (
                  <button
                    onClick={() => handleUpdateStatus(job.id, "en_route")}
                    className="inline-flex items-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-medium"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    On My Way
                  </button>
                )}

                {(job.status === "en_route" || job.status === "arrived") && (
                  <button
                    onClick={() => handleUpdateStatus(job.id, "in_progress")}
                    className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    Start Work
                  </button>
                )}

                {job.status === "in_progress" && (
                  <>
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">
                      <Camera className="h-4 w-4 mr-2" />
                      Add Photos
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(job.id, "completed")}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </button>
                  </>
                )}

                {job.status === "completed" && (
                  <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">
                    <Send className="h-4 w-4 mr-2" />
                    Submit Invoice
                  </button>
                )}

                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(job.property_address + " " + job.property_postcode)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Navigate
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
