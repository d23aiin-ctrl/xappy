"use client";

import { CalendarCheck, Clock, User, MapPin, Phone, Plus, Calendar, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

const appointments = [
  {
    id: 1,
    doctor: "Dr. Samantha Perera",
    specialty: "Cardiologist",
    hospital: "National Hospital",
    date: "2026-01-22",
    time: "10:00 AM",
    status: "confirmed",
    type: "Follow-up",
  },
  {
    id: 2,
    doctor: "Dr. Priya Jayawardena",
    specialty: "Pediatrician",
    hospital: "Ninewells Hospital",
    date: "2026-01-25",
    time: "2:30 PM",
    status: "pending",
    type: "Consultation",
  },
  {
    id: 3,
    doctor: "Dr. Nimal Fernando",
    specialty: "General Physician",
    hospital: "Hemas Hospital",
    date: "2026-01-18",
    time: "9:00 AM",
    status: "completed",
    type: "Check-up",
  },
];

const upcomingSlots = [
  { date: "Tomorrow", slots: ["9:00 AM", "10:30 AM", "2:00 PM", "4:30 PM"] },
  { date: "Jan 23", slots: ["8:30 AM", "11:00 AM", "3:00 PM"] },
  { date: "Jan 24", slots: ["9:30 AM", "1:00 PM", "5:00 PM"] },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "confirmed":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle2 className="h-3 w-3" />
          Confirmed
        </span>
      );
    case "pending":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
          <AlertCircle className="h-3 w-3" />
          Pending
        </span>
      );
    case "completed":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
          <CheckCircle2 className="h-3 w-3" />
          Completed
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          <XCircle className="h-3 w-3" />
          Cancelled
        </span>
      );
    default:
      return null;
  }
}

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Appointments</h1>
          <p className="text-slate-600 mt-1">Manage your healthcare appointments</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors">
          <Plus className="h-5 w-5" />
          Book Appointment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center">
              <CalendarCheck className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">2</p>
              <p className="text-xs text-slate-500">Upcoming</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">12</p>
              <p className="text-xs text-slate-500">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">1</p>
              <p className="text-xs text-slate-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">0</p>
              <p className="text-xs text-slate-500">Cancelled</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Appointments List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Your Appointments</h2>
          {appointments.map((apt) => (
            <div key={apt.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                    {apt.doctor.split(" ")[1]?.charAt(0) || "D"}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{apt.doctor}</h3>
                    <p className="text-sm text-teal-600">{apt.specialty}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="h-4 w-4" />
                      {apt.hospital}
                    </p>
                  </div>
                </div>
                {getStatusBadge(apt.status)}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  {new Date(apt.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="h-4 w-4 text-slate-400" />
                  {apt.time}
                </div>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                  {apt.type}
                </span>
              </div>
              {apt.status !== "completed" && apt.status !== "cancelled" && (
                <div className="mt-4 flex gap-2">
                  <button className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors">
                    Reschedule
                  </button>
                  <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Book */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Available Slots</h2>
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
            {upcomingSlots.map((day) => (
              <div key={day.date}>
                <p className="text-sm font-semibold text-slate-900 mb-2">{day.date}</p>
                <div className="flex flex-wrap gap-2">
                  {day.slots.map((slot) => (
                    <button
                      key={slot}
                      className="px-3 py-1.5 text-sm border border-teal-200 text-teal-700 rounded-lg hover:bg-teal-50 transition-colors"
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button className="w-full mt-4 px-4 py-2.5 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors">
              View All Slots
            </button>
          </div>

          {/* Reminders */}
          <div className="mt-4 bg-teal-50 rounded-xl p-4">
            <h3 className="font-semibold text-teal-800 mb-2">Appointment Reminders</h3>
            <ul className="space-y-2 text-sm text-teal-700">
              <li>• Arrive 15 minutes early</li>
              <li>• Bring previous medical records</li>
              <li>• List your current medications</li>
              <li>• Prepare questions for doctor</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
