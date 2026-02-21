"use client";

import { useEffect, useState } from "react";
import {
  Wrench,
  Plus,
  Camera,
  Send,
  AlertTriangle,
  Clock,
  CheckCircle,
  ChevronRight,
  MessageCircle,
} from "lucide-react";

interface Issue {
  id: string;
  title: string;
  category: string;
  status: string;
  status_label: string;
  reported_at: string;
  last_update?: string;
  is_emergency: boolean;
}

const categoryOptions = [
  { value: "plumbing", label: "Plumbing (taps, toilets, pipes)" },
  { value: "electrical", label: "Electrical (lights, sockets, fuses)" },
  { value: "heating", label: "Heating & Hot Water" },
  { value: "appliances", label: "Appliances (oven, fridge, washing machine)" },
  { value: "windows_doors", label: "Windows & Doors" },
  { value: "damp_mould", label: "Damp & Mould" },
  { value: "pest_control", label: "Pest Control" },
  { value: "security", label: "Security (locks, alarms)" },
  { value: "general", label: "General Maintenance" },
  { value: "other", label: "Other" },
];

const mockIssues: Issue[] = [
  {
    id: "1",
    title: "Dripping tap in bathroom",
    category: "plumbing",
    status: "in_progress",
    status_label: "In Progress",
    reported_at: "2024-01-25T10:00:00Z",
    last_update: "Plumber scheduled for Wednesday 10am-12pm",
    is_emergency: false,
  },
  {
    id: "2",
    title: "Boiler making unusual noise",
    category: "heating",
    status: "acknowledged",
    status_label: "Acknowledged",
    reported_at: "2024-01-28T09:00:00Z",
    is_emergency: false,
  },
];

export default function TenantIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewIssueForm, setShowNewIssueForm] = useState(false);
  const [newIssue, setNewIssue] = useState({
    title: "",
    category: "",
    description: "",
    is_emergency: false,
    location: "",
  });

  useEffect(() => {
    setTimeout(() => {
      setIssues(mockIssues);
      setLoading(false);
    }, 500);
  }, []);

  const handleSubmitIssue = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, would submit to API
    const issue: Issue = {
      id: String(Date.now()),
      title: newIssue.title,
      category: newIssue.category,
      status: "reported",
      status_label: "Reported",
      reported_at: new Date().toISOString(),
      is_emergency: newIssue.is_emergency,
    };
    setIssues([issue, ...issues]);
    setShowNewIssueForm(false);
    setNewIssue({ title: "", category: "", description: "", is_emergency: false, location: "" });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "reported":
      case "acknowledged":
        return <Clock className="h-4 w-4 text-amber-600" />;
      case "in_progress":
        return <Wrench className="h-4 w-4 text-blue-600" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "reported":
        return "bg-gray-100 text-gray-700";
      case "acknowledged":
        return "bg-amber-100 text-amber-700";
      case "in_progress":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Issues</h1>
          <p className="text-sm text-gray-500 mt-1">
            Report and track issues with your property
          </p>
        </div>
        <button
          onClick={() => setShowNewIssueForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          <Plus className="h-5 w-5 mr-2" />
          Report Issue
        </button>
      </div>

      {/* Emergency Banner */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Emergency?</p>
            <p className="text-sm text-red-700 mt-1">
              For gas leaks, floods, or security emergencies, call <strong>0800 123 4567</strong> immediately.
            </p>
          </div>
        </div>
      </div>

      {/* New Issue Form */}
      {showNewIssueForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Report a New Issue</h2>
          <form onSubmit={handleSubmitIssue} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What's the issue? *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Dripping tap in bathroom"
                value={newIssue.title}
                onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                required
                value={newIssue.category}
                onChange={(e) => setNewIssue({ ...newIssue, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a category</option>
                {categoryOptions.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Where in the property?
              </label>
              <input
                type="text"
                placeholder="e.g., Main bathroom, Kitchen"
                value={newIssue.location}
                onChange={(e) => setNewIssue({ ...newIssue, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Please provide any additional details..."
                value={newIssue.description}
                onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newIssue.is_emergency}
                  onChange={(e) => setNewIssue({ ...newIssue, is_emergency: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  This is an emergency (no heating/hot water, flood, security issue)
                </span>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                <Camera className="h-4 w-4 mr-2" />
                Add Photos
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowNewIssueForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Issue
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Issues List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Your Reported Issues</h2>

        {issues.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No issues reported</h3>
            <p className="text-gray-500 mb-4">You haven't reported any maintenance issues yet.</p>
            <button
              onClick={() => setShowNewIssueForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <Plus className="h-5 w-5 mr-2" />
              Report Your First Issue
            </button>
          </div>
        ) : (
          issues.map((issue) => (
            <div
              key={issue.id}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                      {getStatusIcon(issue.status)}
                      <span className="ml-1.5">{issue.status_label}</span>
                    </span>
                    {issue.is_emergency && (
                      <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                        Emergency
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{issue.title}</h3>
                  <p className="text-sm text-gray-500">
                    Reported {new Date(issue.reported_at).toLocaleDateString()}
                  </p>
                  {issue.last_update && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-start">
                        <MessageCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
                        <p className="text-sm text-blue-800">{issue.last_update}</p>
                      </div>
                    </div>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
