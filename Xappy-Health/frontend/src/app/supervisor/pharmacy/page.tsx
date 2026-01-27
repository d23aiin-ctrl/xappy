"use client";

import { Pill, Search, Clock, MapPin, Phone, AlertTriangle, ShieldCheck, Info } from "lucide-react";
import { useState } from "react";

const pharmacies = [
  {
    id: 1,
    name: "State Pharmaceuticals Corporation",
    type: "Government",
    address: "75, Sir Baron Jayatilaka Mawatha, Colombo 01",
    phone: "+94 11 232 0356",
    hours: "8:00 AM - 8:00 PM",
    services: ["Prescription", "OTC", "Medical Supplies"],
  },
  {
    id: 2,
    name: "Osu Sala Pharmacy",
    type: "Government",
    address: "Multiple Locations Islandwide",
    phone: "+94 11 269 4200",
    hours: "24/7",
    services: ["Prescription", "OTC", "Affordable Medicines"],
  },
  {
    id: 3,
    name: "Healthguard Pharmacy",
    type: "Private",
    address: "Colombo and Suburbs",
    phone: "+94 11 573 7777",
    hours: "8:00 AM - 10:00 PM",
    services: ["Prescription", "OTC", "Home Delivery"],
  },
  {
    id: 4,
    name: "Lanka Pharmacy",
    type: "Private",
    address: "Multiple Locations",
    phone: "+94 11 255 5555",
    hours: "7:00 AM - 11:00 PM",
    services: ["Prescription", "OTC", "Cosmetics", "Baby Care"],
  },
];

const commonMedicines = [
  { name: "Paracetamol", use: "Pain & Fever", dosage: "500mg-1000mg every 4-6 hours", warning: "Max 4g/day" },
  { name: "Cetirizine", use: "Allergies", dosage: "10mg once daily", warning: "May cause drowsiness" },
  { name: "Omeprazole", use: "Acid Reflux", dosage: "20mg before meals", warning: "Take on empty stomach" },
  { name: "Ibuprofen", use: "Pain & Inflammation", dosage: "200-400mg every 4-6 hours", warning: "Take with food" },
  { name: "ORS", use: "Dehydration", dosage: "As directed", warning: "Dissolve in clean water" },
  { name: "Vitamin C", use: "Immunity", dosage: "500-1000mg daily", warning: "May upset stomach" },
];

export default function PharmacyPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pharmacy & Medicines</h1>
        <p className="text-slate-600 mt-1">Find pharmacies and medicine information</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search medicines or pharmacies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
        />
      </div>

      {/* Emergency Notice */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
        <div>
          <p className="font-semibold text-red-800">Emergency Medicine Hotline</p>
          <p className="text-sm text-red-700">For poison control or medicine emergencies, call: <strong>+94 11 268 6143</strong></p>
        </div>
      </div>

      {/* Pharmacies */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Nearby Pharmacies</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {pharmacies.map((pharmacy) => (
            <div key={pharmacy.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <Pill className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-slate-900">{pharmacy.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      pharmacy.type === "Government" ? "bg-blue-100 text-blue-700" : "bg-teal-100 text-teal-700"
                    }`}>
                      {pharmacy.type}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-slate-600">
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      {pharmacy.address}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      {pharmacy.hours}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {pharmacy.services.map((service) => (
                      <span key={service} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                        {service}
                      </span>
                    ))}
                  </div>
                  <a
                    href={`tel:${pharmacy.phone}`}
                    className="mt-3 inline-flex items-center gap-2 text-sm text-teal-600 font-medium hover:text-teal-700"
                  >
                    <Phone className="h-4 w-4" />
                    {pharmacy.phone}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Common Medicines */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Common Medicines Reference</h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Medicine</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Use</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Dosage</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Warning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {commonMedicines.map((med) => (
                  <tr key={med.name} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{med.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{med.use}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{med.dosage}</td>
                    <td className="px-4 py-3 text-sm text-amber-600">{med.warning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Safety Tips */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-6 w-6 text-teal-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-teal-800">Medicine Safety Tips</h3>
            <ul className="mt-2 space-y-1 text-sm text-teal-700">
              <li>• Always check expiry dates before taking medicines</li>
              <li>• Store medicines in a cool, dry place away from children</li>
              <li>• Never share prescription medicines with others</li>
              <li>• Complete the full course of antibiotics as prescribed</li>
              <li>• Consult a doctor or pharmacist if unsure about dosage</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          <strong>Disclaimer:</strong> This information is for reference only. Always consult a healthcare professional before taking any medication.
        </p>
      </div>
    </div>
  );
}
