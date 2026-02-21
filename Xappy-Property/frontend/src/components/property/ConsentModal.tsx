"use client";

import { useState } from "react";
import { Shield, X, Check, AlertTriangle } from "lucide-react";

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConsent: (consent: ConsentData) => void;
  title?: string;
  dataTypes?: string[];
  purposes?: string[];
  retentionPeriod?: string;
}

export interface ConsentData {
  consented: boolean;
  timestamp: string;
  dataTypes: string[];
  purposes: string[];
  ipAddress?: string;
}

const defaultDataTypes = [
  "Identity documents (passport, driving licence)",
  "Proof of address (utility bills, bank statements)",
  "Employment and income verification",
  "References from previous landlords/employers",
  "Contact information",
];

const defaultPurposes = [
  "Tenant referencing and background checks",
  "Compliance with legal and regulatory requirements",
  "Property management and tenancy administration",
  "Communication regarding your tenancy application",
];

export default function ConsentModal({
  isOpen,
  onClose,
  onConsent,
  title = "Data Protection Consent",
  dataTypes = defaultDataTypes,
  purposes = defaultPurposes,
  retentionPeriod = "6 years after tenancy ends (as required by UK law)",
}: ConsentModalProps) {
  const [acknowledged, setAcknowledged] = useState({
    dataCollection: false,
    dataPurpose: false,
    dataRights: false,
  });

  const allAcknowledged = Object.values(acknowledged).every(Boolean);

  const handleConsent = () => {
    const consentData: ConsentData = {
      consented: true,
      timestamp: new Date().toISOString(),
      dataTypes,
      purposes,
    };
    onConsent(consentData);
    onClose();
  };

  const handleDecline = () => {
    const consentData: ConsentData = {
      consented: false,
      timestamp: new Date().toISOString(),
      dataTypes: [],
      purposes: [],
    };
    onConsent(consentData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Introduction */}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Under GDPR and UK Data Protection laws, we need your explicit consent to
              collect and process your personal data. Please read the following carefully.
            </p>
          </div>

          {/* Data Collection */}
          <div>
            <div
              className="flex items-start cursor-pointer"
              onClick={() => setAcknowledged(prev => ({ ...prev, dataCollection: !prev.dataCollection }))}
            >
              <div className={`flex-shrink-0 w-5 h-5 rounded border ${
                acknowledged.dataCollection
                  ? "bg-blue-600 border-blue-600"
                  : "border-gray-300"
              } flex items-center justify-center mr-3 mt-0.5`}>
                {acknowledged.dataCollection && <Check className="h-3 w-3 text-white" />}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Data We Collect</h3>
                <p className="text-sm text-gray-500 mt-1">
                  I understand the following data will be collected:
                </p>
                <ul className="mt-2 space-y-1">
                  {dataTypes.map((type, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      {type}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Purpose of Processing */}
          <div>
            <div
              className="flex items-start cursor-pointer"
              onClick={() => setAcknowledged(prev => ({ ...prev, dataPurpose: !prev.dataPurpose }))}
            >
              <div className={`flex-shrink-0 w-5 h-5 rounded border ${
                acknowledged.dataPurpose
                  ? "bg-blue-600 border-blue-600"
                  : "border-gray-300"
              } flex items-center justify-center mr-3 mt-0.5`}>
                {acknowledged.dataPurpose && <Check className="h-3 w-3 text-white" />}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">How We Use Your Data</h3>
                <p className="text-sm text-gray-500 mt-1">
                  I understand my data will be used for:
                </p>
                <ul className="mt-2 space-y-1">
                  {purposes.map((purpose, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      {purpose}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-gray-500 mt-2">
                  <strong>Retention:</strong> {retentionPeriod}
                </p>
              </div>
            </div>
          </div>

          {/* Your Rights */}
          <div>
            <div
              className="flex items-start cursor-pointer"
              onClick={() => setAcknowledged(prev => ({ ...prev, dataRights: !prev.dataRights }))}
            >
              <div className={`flex-shrink-0 w-5 h-5 rounded border ${
                acknowledged.dataRights
                  ? "bg-blue-600 border-blue-600"
                  : "border-gray-300"
              } flex items-center justify-center mr-3 mt-0.5`}>
                {acknowledged.dataRights && <Check className="h-3 w-3 text-white" />}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Your Rights</h3>
                <p className="text-sm text-gray-500 mt-1">
                  I understand I have the right to:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    Access my personal data at any time
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    Request correction of inaccurate data
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    Request deletion of my data (subject to legal requirements)
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    Withdraw consent at any time
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    Lodge a complaint with the Information Commissioner's Office (ICO)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Warning if not all acknowledged */}
          {!allAcknowledged && (
            <div className="bg-amber-50 rounded-lg p-3 flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                Please acknowledge all sections above to proceed.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={handleDecline}
            className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Decline
          </button>
          <button
            onClick={handleConsent}
            disabled={!allAcknowledged}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition ${
              allAcknowledged
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            I Consent
          </button>
        </div>
      </div>
    </div>
  );
}
