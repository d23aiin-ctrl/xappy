import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    submitted: "bg-blue-100 text-blue-800",
    acknowledged: "bg-purple-100 text-purple-800",
    under_review: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-orange-100 text-orange-800",
    resolved: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-800",
    rejected: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
  };
  return colors[severity] || "bg-gray-100 text-gray-800";
}

export function getReportTypeColor(type: string): string {
  const colors: Record<string, string> = {
    near_miss: "bg-yellow-500",
    incident: "bg-red-500",
    daily_safety_log: "bg-blue-500",
    shift_handover: "bg-purple-500",
    toolbox_talk: "bg-green-500",
    ptw_evidence: "bg-orange-500",
    loto_evidence: "bg-pink-500",
    spill_report: "bg-cyan-500",
    inspection: "bg-indigo-500",
  };
  return colors[type] || "bg-gray-500";
}

export function formatReportType(type: string): string {
  const names: Record<string, string> = {
    near_miss: "Near-Miss",
    incident: "Incident",
    daily_safety_log: "Daily Log",
    shift_handover: "Shift Handover",
    toolbox_talk: "Toolbox Talk",
    ptw_evidence: "PTW Evidence",
    loto_evidence: "LOTO Evidence",
    spill_report: "Spill Report",
    inspection: "Inspection",
  };
  return names[type] || type.replace(/_/g, " ");
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}
