"use client";

import { Stethoscope, MapPin, Phone, Clock, Star, Search, Filter, Award } from "lucide-react";
import { useState } from "react";

const doctors = [
  {
    id: 1,
    name: "Dr. Samantha Perera",
    specialty: "Cardiologist",
    qualification: "MD, MRCP (UK)",
    hospital: "National Hospital of Sri Lanka",
    experience: "15 years",
    rating: 4.8,
    availability: "Mon-Fri: 9AM-5PM",
    phone: "+94 77 123 4567",
    consultationFee: "Rs. 2,500",
  },
  {
    id: 2,
    name: "Dr. Nimal Fernando",
    specialty: "General Physician",
    qualification: "MBBS, MD",
    hospital: "Hemas Hospital",
    experience: "12 years",
    rating: 4.6,
    availability: "Mon-Sat: 8AM-6PM",
    phone: "+94 77 234 5678",
    consultationFee: "Rs. 1,500",
  },
  {
    id: 3,
    name: "Dr. Priya Jayawardena",
    specialty: "Pediatrician",
    qualification: "MBBS, DCH, MD",
    hospital: "Ninewells Hospital",
    experience: "10 years",
    rating: 4.9,
    availability: "Mon-Fri: 10AM-4PM",
    phone: "+94 77 345 6789",
    consultationFee: "Rs. 2,000",
  },
  {
    id: 4,
    name: "Dr. Anil Rathnayake",
    specialty: "Orthopedic Surgeon",
    qualification: "MBBS, MS (Ortho)",
    hospital: "Asiri Central Hospital",
    experience: "18 years",
    rating: 4.7,
    availability: "Tue-Sat: 9AM-3PM",
    phone: "+94 77 456 7890",
    consultationFee: "Rs. 3,000",
  },
  {
    id: 5,
    name: "Dr. Kumari Silva",
    specialty: "Gynecologist",
    qualification: "MBBS, MD, FRCOG",
    hospital: "Lanka Hospitals",
    experience: "20 years",
    rating: 4.8,
    availability: "Mon-Thu: 9AM-5PM",
    phone: "+94 77 567 8901",
    consultationFee: "Rs. 2,500",
  },
  {
    id: 6,
    name: "Dr. Rohan De Silva",
    specialty: "Neurologist",
    qualification: "MBBS, MD, DM",
    hospital: "Teaching Hospital Kandy",
    experience: "14 years",
    rating: 4.5,
    availability: "Mon-Fri: 8AM-2PM",
    phone: "+94 77 678 9012",
    consultationFee: "Rs. 2,800",
  },
];

const specialties = ["All", "Cardiologist", "General Physician", "Pediatrician", "Orthopedic Surgeon", "Gynecologist", "Neurologist"];

export default function DoctorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("All");

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.hospital.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = filterSpecialty === "All" || doctor.specialty === filterSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Find Doctors</h1>
          <p className="text-slate-600 mt-1">Connect with qualified healthcare professionals</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-teal-600 bg-teal-50 px-3 py-2 rounded-lg">
          <Stethoscope className="h-4 w-4" />
          <span>{doctors.length} Doctors Available</span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search doctors by name or hospital..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-slate-400" />
          <select
            value={filterSpecialty}
            onChange={(e) => setFilterSpecialty(e.target.value)}
            className="px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 outline-none"
          >
            {specialties.map((spec) => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctor Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredDoctors.map((doctor) => (
          <div
            key={doctor.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center flex-shrink-0 text-white text-xl font-bold">
                {doctor.name.split(" ")[1]?.charAt(0) || "D"}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{doctor.name}</h3>
                    <p className="text-teal-600 font-medium">{doctor.specialty}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {doctor.rating}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-slate-400" />
                    <span>{doctor.qualification} • {doctor.experience}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span>{doctor.hospital}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>{doctor.availability}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="text-lg font-bold text-teal-600">{doctor.consultationFee}</span>
                  <a
                    href={`tel:${doctor.phone}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    Book Appointment
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Stethoscope className="h-12 w-12 mx-auto mb-4 text-slate-300" />
          <p>No doctors found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
