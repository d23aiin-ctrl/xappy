"use client";

import { useState, useCallback } from "react";
import {
  Upload,
  X,
  FileText,
  Image,
  AlertCircle,
  CheckCircle,
  Loader2,
  Shield,
} from "lucide-react";

interface SecureUploaderProps {
  onUpload: (file: File, documentType: string) => Promise<void>;
  documentType: string;
  documentLabel: string;
  acceptedTypes?: string[];
  maxSizeMB?: number;
  requiresConsent?: boolean;
  consentText?: string;
  onConsentChange?: (consented: boolean) => void;
}

interface UploadedFile {
  file: File;
  preview?: string;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

export default function SecureUploader({
  onUpload,
  documentType,
  documentLabel,
  acceptedTypes = ["image/jpeg", "image/png", "application/pdf"],
  maxSizeMB = 10,
  requiresConsent = true,
  consentText = "I consent to my document being stored securely and processed in accordance with GDPR regulations. I understand my data will be encrypted and access will be logged.",
  onConsentChange,
}: SecureUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const [showConsent, setShowConsent] = useState(false);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Accepted: ${acceptedTypes.map(t => t.split('/')[1]).join(', ')}`;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File too large. Maximum size: ${maxSizeMB}MB`;
    }
    return null;
  };

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);

    const processedFiles: UploadedFile[] = fileArray.map(file => {
      const error = validateFile(file);
      return {
        file,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
        status: error ? "error" : "pending",
        error,
      } as UploadedFile;
    });

    setFiles(prev => [...prev, ...processedFiles]);

    // If consent required and not yet given, show consent modal
    if (requiresConsent && !hasConsented) {
      setShowConsent(true);
    }
  }, [hasConsented, requiresConsent, maxSizeMB, acceptedTypes]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleConsent = () => {
    setHasConsented(true);
    setShowConsent(false);
    onConsentChange?.(true);
  };

  const uploadFiles = async () => {
    if (requiresConsent && !hasConsented) {
      setShowConsent(true);
      return;
    }

    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== "pending") continue;

      setFiles(prev => {
        const updated = [...prev];
        updated[i] = { ...updated[i], status: "uploading" };
        return updated;
      });

      try {
        await onUpload(files[i].file, documentType);
        setFiles(prev => {
          const updated = [...prev];
          updated[i] = { ...updated[i], status: "success" };
          return updated;
        });
      } catch (error) {
        setFiles(prev => {
          const updated = [...prev];
          updated[i] = { ...updated[i], status: "error", error: "Upload failed" };
          return updated;
        });
      }
    }
  };

  const pendingFiles = files.filter(f => f.status === "pending");

  return (
    <div className="space-y-4">
      {/* Document type label */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">{documentLabel}</h3>
        {hasConsented && (
          <span className="flex items-center text-xs text-green-600">
            <Shield className="h-3 w-3 mr-1" />
            GDPR Consent Given
          </span>
        )}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input
          type="file"
          accept={acceptedTypes.join(",")}
          onChange={handleInputChange}
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Upload className={`h-10 w-10 mx-auto mb-3 ${isDragging ? "text-blue-500" : "text-gray-400"}`} />
        <p className="text-gray-600 font-medium">
          Drop files here or click to browse
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {acceptedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')} up to {maxSizeMB}MB
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className={`flex items-center p-3 rounded-lg border ${
                file.status === "error"
                  ? "border-red-200 bg-red-50"
                  : file.status === "success"
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 bg-gray-50"
              }`}
            >
              {/* Preview / Icon */}
              <div className="flex-shrink-0 w-10 h-10 rounded bg-white border border-gray-200 flex items-center justify-center overflow-hidden mr-3">
                {file.preview ? (
                  <img src={file.preview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <FileText className="h-5 w-5 text-gray-400" />
                )}
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{file.file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {file.error && (
                  <p className="text-xs text-red-600 flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {file.error}
                  </p>
                )}
              </div>

              {/* Status / Remove */}
              <div className="flex-shrink-0 ml-3">
                {file.status === "uploading" ? (
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                ) : file.status === "success" ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : file.status === "error" ? (
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-red-100 rounded"
                  >
                    <X className="h-5 w-5 text-red-500" />
                  </button>
                ) : (
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {pendingFiles.length > 0 && (
        <button
          onClick={uploadFiles}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Upload {pendingFiles.length} file{pendingFiles.length > 1 ? "s" : ""}
        </button>
      )}

      {/* Consent Modal */}
      {showConsent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Data Protection Consent</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">{consentText}</p>
            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <ul className="text-xs text-blue-800 space-y-1">
                <li>Documents are encrypted at rest</li>
                <li>Access is logged and auditable</li>
                <li>You can request deletion at any time</li>
                <li>Data is retained per legal requirements</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConsent(false);
                  setFiles([]);
                }}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConsent}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                I Consent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
