"use client";

import { Siren, Phone, Ambulance, Shield, Flame, AlertTriangle, Heart, Clock, MapPin } from "lucide-react";

const emergencyNumbers = [
  { name: "Emergency Services (Police/Fire/Ambulance)", number: "119", icon: Siren, color: "from-red-500 to-rose-500", description: "24/7 National Emergency Hotline" },
  { name: "Suwa Seriya Ambulance", number: "1990", icon: Ambulance, color: "from-red-600 to-red-500", description: "Free 24/7 Ambulance Service" },
  { name: "Police Emergency", number: "118", icon: Shield, color: "from-blue-600 to-blue-500", description: "Sri Lanka Police" },
  { name: "Fire & Rescue", number: "110", icon: Flame, color: "from-orange-500 to-red-500", description: "Fire Department" },
  { name: "Accident Service", number: "011-269-1111", icon: AlertTriangle, color: "from-amber-500 to-orange-500", description: "National Hospital" },
  { name: "Poison Control", number: "011-268-6143", icon: AlertTriangle, color: "from-purple-500 to-pink-500", description: "Poison Information Centre" },
];

const emergencyHospitals = [
  { name: "National Hospital - Emergency", address: "Regent Street, Colombo 10", phone: "011-269-1111", available: "24/7" },
  { name: "Lady Ridgeway Hospital", address: "Dr. Danister de Silva Mawatha", phone: "011-269-3711", available: "24/7 (Children)" },
  { name: "De Soysa Maternity Hospital", address: "Kynsey Road, Colombo 08", phone: "011-269-6224", available: "24/7 (Maternity)" },
  { name: "Colombo South Teaching Hospital", address: "Kalubowila, Dehiwala", phone: "011-276-3261", available: "24/7" },
];

const firstAidTips = [
  {
    title: "Heart Attack Warning Signs",
    symptoms: ["Chest pain or discomfort", "Shortness of breath", "Pain in arm, neck, or jaw", "Cold sweats, nausea"],
    action: "Call 1990 immediately. Have the person rest in a comfortable position.",
  },
  {
    title: "Stroke Warning Signs (FAST)",
    symptoms: ["Face drooping", "Arm weakness", "Speech difficulty", "Time to call emergency"],
    action: "Call 1990 immediately. Note the time symptoms started.",
  },
  {
    title: "Severe Bleeding",
    symptoms: ["Heavy blood loss", "Blood soaking through bandages"],
    action: "Apply firm pressure with clean cloth. Elevate the wound above heart level if possible.",
  },
  {
    title: "Choking",
    symptoms: ["Cannot speak or breathe", "Clutching throat", "Turning blue"],
    action: "Perform Heimlich maneuver: Stand behind, make a fist above navel, thrust upward.",
  },
];

export default function EmergencyPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center">
            <Siren className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Emergency Services</h1>
            <p className="text-red-100 mt-1">Quick access to emergency contacts and first aid information</p>
          </div>
        </div>
      </div>

      {/* Main Emergency Number */}
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
              <Phone className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-red-600 font-medium">24/7 FREE Ambulance Service</p>
              <p className="text-4xl font-bold text-red-700">1990</p>
              <p className="text-sm text-red-600">Suwa Seriya - Island Wide Coverage</p>
            </div>
          </div>
          <a
            href="tel:1990"
            className="px-8 py-4 bg-red-600 text-white rounded-xl font-bold text-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
          >
            Call Now
          </a>
        </div>
      </div>

      {/* Emergency Numbers Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Emergency Contact Numbers</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {emergencyNumbers.map((item) => (
            <a
              key={item.number}
              href={`tel:${item.number.replace(/-/g, "")}`}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-lg transition-all hover:scale-[1.02]"
            >
              <div className="flex items-start gap-3">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{item.name}</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{item.number}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Emergency Hospitals */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">24/7 Emergency Hospitals</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {emergencyHospitals.map((hospital) => (
            <div key={hospital.name} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">{hospital.name}</h3>
                  <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" />
                    {hospital.address}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  <Clock className="h-3 w-3" />
                  {hospital.available}
                </span>
              </div>
              <a
                href={`tel:${hospital.phone.replace(/-/g, "")}`}
                className="mt-3 inline-flex items-center gap-2 text-teal-600 font-semibold hover:text-teal-700"
              >
                <Phone className="h-4 w-4" />
                {hospital.phone}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* First Aid Tips */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">First Aid Quick Guide</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {firstAidTips.map((tip) => (
            <div key={tip.title} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="h-5 w-5 text-red-500" />
                <h3 className="font-bold text-slate-900">{tip.title}</h3>
              </div>
              <div className="mb-3">
                <p className="text-xs font-medium text-slate-500 uppercase mb-2">Warning Signs:</p>
                <ul className="space-y-1">
                  {tip.symptoms.map((symptom) => (
                    <li key={symptom} className="text-sm text-slate-600 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                      {symptom}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-teal-50 rounded-lg p-3">
                <p className="text-xs font-medium text-teal-700 uppercase mb-1">What to do:</p>
                <p className="text-sm text-teal-800">{tip.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0" />
        <div>
          <p className="font-semibold text-amber-800">Important</p>
          <p className="text-sm text-amber-700">
            In case of emergency, always call for professional help first. The first aid tips provided are basic guidelines
            and should not replace proper medical training or professional medical care.
          </p>
        </div>
      </div>
    </div>
  );
}
