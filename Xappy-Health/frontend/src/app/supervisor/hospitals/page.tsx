"use client";

import { Building2, MapPin, Phone, Clock, Star, Search, Filter } from "lucide-react";
import { useState } from "react";

const hospitals = [
  {
    id: 1,
    name: "National Hospital of Sri Lanka",
    type: "Government",
    district: "Colombo",
    address: "Regent Street, Colombo 10",
    phone: "+94 11 269 1111",
    emergency: "24/7",
    rating: 4.2,
    specialties: ["Emergency", "Cardiology", "Neurology", "Oncology", "Pediatrics"],
  },
  {
    id: 2,
    name: "Hemas Hospital Thalawathugoda",
    type: "Private",
    district: "Colombo",
    address: "Talawatugoda Road, Colombo",
    phone: "+94 11 788 8888",
    emergency: "24/7",
    rating: 4.5,
    specialties: ["Emergency", "Diagnostics", "General Medicine", "Surgery"],
  },
  {
    id: 3,
    name: "Ninewells Hospital",
    type: "Private",
    district: "Colombo",
    address: "Flower Road, Colombo 07",
    phone: "+94 11 204 9999",
    emergency: "24/7",
    rating: 4.6,
    specialties: ["Women Care", "Child Care", "Maternity", "Fertility"],
  },
  {
    id: 4,
    name: "Asiri Central Hospital",
    type: "Private",
    district: "Colombo",
    address: "Norris Canal Road, Colombo 10",
    phone: "+94 11 466 5500",
    emergency: "24/7",
    rating: 4.4,
    specialties: ["Cardiology", "Orthopedics", "Neurosurgery", "Oncology"],
  },
  {
    id: 5,
    name: "Lanka Hospitals",
    type: "Private",
    district: "Colombo",
    address: "Elvitigala Mawatha, Colombo 05",
    phone: "+94 11 553 0000",
    emergency: "24/7",
    rating: 4.3,
    specialties: ["Multi-specialty", "Diagnostics", "Emergency Care"],
  },
  {
    id: 6,
    name: "Teaching Hospital Kandy",
    type: "Government",
    district: "Kandy",
    address: "William Gopallawa Mawatha, Kandy",
    phone: "+94 81 222 2261",
    emergency: "24/7",
    rating: 4.0,
    specialties: ["General Medicine", "Surgery", "Pediatrics", "Obstetrics"],
  },
];

export default function HospitalsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filteredHospitals = hospitals.filter((hospital) => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || hospital.type.toLowerCase() === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Healthcare Facilities</h1>
          <p className="text-slate-600 mt-1">Find hospitals and medical centers near you</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-teal-600 bg-teal-50 px-3 py-2 rounded-lg">
          <Building2 className="h-4 w-4" />
          <span>{hospitals.length} Facilities Listed</span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search hospitals by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 outline-none"
          >
            <option value="all">All Types</option>
            <option value="government">Government</option>
            <option value="private">Private</option>
          </select>
        </div>
      </div>

      {/* Hospital Cards */}
      <div className="grid gap-4">
        {filteredHospitals.map((hospital) => (
          <div
            key={hospital.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{hospital.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      hospital.type === "Government"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-teal-100 text-teal-700"
                    }`}>
                      {hospital.type}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                      <MapPin className="h-4 w-4" />
                      {hospital.district}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {hospital.rating}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">{hospital.address}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {hospital.specialties.slice(0, 4).map((spec) => (
                      <span key={spec} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                        {spec}
                      </span>
                    ))}
                    {hospital.specialties.length > 4 && (
                      <span className="text-xs text-teal-600">+{hospital.specialties.length - 4} more</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap lg:flex-col gap-2 lg:items-end">
                <a
                  href={`tel:${hospital.phone}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  Call Now
                </a>
                <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  Emergency: {hospital.emergency}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredHospitals.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-slate-300" />
          <p>No hospitals found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
