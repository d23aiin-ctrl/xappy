"use client";

import { useState } from "react";
import {
  FileText,
  Eye,
  Download,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Shield,
  MoreVertical,
} from "lucide-react";
import type { TenantDocument, DocumentStatus, DocumentType } from "@/types";

interface DocumentListProps {
  documents: Partial<TenantDocument>[];
  onView?: (doc: Partial<TenantDocument>) => void;
  onDownload?: (doc: Partial<TenantDocument>) => void;
  onDelete?: (doc: Partial<TenantDocument>) => void;
  onVerify?: (doc: Partial<TenantDocument>, approved: boolean) => void;
  showActions?: boolean;
  showVerifyActions?: boolean;
  emptyMessage?: string;
}

const statusConfig: Record<DocumentStatus, { icon: typeof CheckCircle; color: string; bgColor: string; label: string }> = {
  requested: { icon: Clock, color: "text-gray-600", bgColor: "bg-gray-100", label: "Requested" },
  uploaded: { icon: Clock, color: "text-blue-600", bgColor: "bg-blue-100", label: "Uploaded" },
  pending_review: { icon: Clock, color: "text-amber-600", bgColor: "bg-amber-100", label: "Pending Review" },
  verified: { icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-100", label: "Verified" },
  rejected: { icon: XCircle, color: "text-red-600", bgColor: "bg-red-100", label: "Rejected" },
  expired: { icon: AlertCircle, color: "text-orange-600", bgColor: "bg-orange-100", label: "Expired" },
  gdpr_deleted: { icon: Shield, color: "text-gray-500", bgColor: "bg-gray-100", label: "Deleted (GDPR)" },
};

const typeLabels: Record<DocumentType, string> = {
  passport: "Passport",
  driving_licence: "Driving Licence",
  national_id: "National ID",
  biometric_residence_permit: "Biometric Residence Permit",
  visa: "Visa",
  utility_bill: "Utility Bill",
  bank_statement: "Bank Statement",
  council_tax_bill: "Council Tax Bill",
  payslip: "Payslip",
  employment_contract: "Employment Contract",
  tax_return: "Tax Return",
  company_accounts: "Company Accounts",
  employer_reference: "Employer Reference",
  landlord_reference: "Landlord Reference",
  character_reference: "Character Reference",
  proof_of_benefits: "Proof of Benefits",
  other: "Other Document",
};

export default function DocumentList({
  documents,
  onView,
  onDownload,
  onDelete,
  onVerify,
  showActions = true,
  showVerifyActions = false,
  emptyMessage = "No documents uploaded yet",
}: DocumentListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => {
        const status = statusConfig[doc.status || "requested"];
        const StatusIcon = status.icon;

        return (
          <div
            key={doc.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start flex-1">
                {/* Document icon */}
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                  <FileText className="h-5 w-5 text-gray-500" />
                </div>

                {/* Document info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 truncate">
                      {typeLabels[doc.document_type!] || doc.document_type}
                    </h4>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status.label}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 truncate">{doc.file_name}</p>

                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    {doc.file_size_bytes && (
                      <span>{(doc.file_size_bytes / 1024 / 1024).toFixed(2)} MB</span>
                    )}
                    {doc.created_at && (
                      <span>Uploaded {new Date(doc.created_at).toLocaleDateString()}</span>
                    )}
                    {doc.expiry_date && (
                      <span className={new Date(doc.expiry_date) < new Date() ? "text-red-500" : ""}>
                        Expires {new Date(doc.expiry_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Rejection reason */}
                  {doc.status === "rejected" && doc.rejection_reason && (
                    <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                      <strong>Reason:</strong> {doc.rejection_reason}
                    </div>
                  )}

                  {/* GDPR consent info */}
                  {doc.gdpr_consent_given && (
                    <div className="mt-2 flex items-center text-xs text-green-600">
                      <Shield className="h-3 w-3 mr-1" />
                      GDPR consent recorded {doc.gdpr_consent_timestamp && new Date(doc.gdpr_consent_timestamp).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {showActions && (
                <div className="flex items-center gap-1 ml-4">
                  {onView && doc.status !== "gdpr_deleted" && (
                    <button
                      onClick={() => onView(doc)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  {onDownload && doc.status !== "gdpr_deleted" && (
                    <button
                      onClick={() => onDownload(doc)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                  {onDelete && doc.status !== "gdpr_deleted" && (
                    <button
                      onClick={() => onDelete(doc)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Verify Actions (for property managers) */}
            {showVerifyActions && doc.status === "pending_review" && onVerify && (
              <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                <button
                  onClick={() => onVerify(doc, true)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify Document
                </button>
                <button
                  onClick={() => onVerify(doc, false)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-sm font-medium"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
