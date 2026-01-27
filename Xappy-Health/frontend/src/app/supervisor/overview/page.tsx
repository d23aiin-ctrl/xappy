"use client";

import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  Building2,
  ChevronRight,
  Clock,
  FileText,
  Heart,
  MapPin,
  Stethoscope,
  Syringe,
  TrendingDown,
  TrendingUp,
  Users,
  Thermometer,
  CheckCircle2,
  ArrowUpRight,
  Virus,
  Droplets,
  Wind,
} from "lucide-react";

// Province data for Sri Lanka
const provinceData: Record<string, {
  name: string;
  hospitals: number;
  doctors: number;
  patients: number;
  cases: { dengue: number; respiratory: number; diabetes: number };
  alerts: number;
  immunization: number;
  color: string;
}> = {
  western: {
    name: "Western",
    hospitals: 89,
    doctors: 456,
    patients: 12450,
    cases: { dengue: 342, respiratory: 256, diabetes: 189 },
    alerts: 1,
    immunization: 82,
    color: "#0D9488",
  },
  central: {
    name: "Central",
    hospitals: 67,
    doctors: 312,
    patients: 8920,
    cases: { dengue: 156, respiratory: 198, diabetes: 145 },
    alerts: 0,
    immunization: 71,
    color: "#14B8A6",
  },
  southern: {
    name: "Southern",
    hospitals: 54,
    doctors: 287,
    patients: 6780,
    cases: { dengue: 234, respiratory: 167, diabetes: 123 },
    alerts: 1,
    immunization: 64,
    color: "#2DD4BF",
  },
  northern: {
    name: "Northern",
    hospitals: 42,
    doctors: 198,
    patients: 4560,
    cases: { dengue: 89, respiratory: 134, diabetes: 98 },
    alerts: 0,
    immunization: 58,
    color: "#5EEAD4",
  },
  eastern: {
    name: "Eastern",
    hospitals: 38,
    doctors: 165,
    patients: 5230,
    cases: { dengue: 267, respiratory: 145, diabetes: 87 },
    alerts: 2,
    immunization: 52,
    color: "#99F6E4",
  },
  northwestern: {
    name: "North Western",
    hospitals: 45,
    doctors: 234,
    patients: 5890,
    cases: { dengue: 178, respiratory: 156, diabetes: 112 },
    alerts: 0,
    immunization: 67,
    color: "#14B8A6",
  },
  northcentral: {
    name: "North Central",
    hospitals: 32,
    doctors: 145,
    patients: 3450,
    cases: { dengue: 123, respiratory: 98, diabetes: 76 },
    alerts: 0,
    immunization: 61,
    color: "#2DD4BF",
  },
  uva: {
    name: "Uva",
    hospitals: 28,
    doctors: 132,
    patients: 2980,
    cases: { dengue: 67, respiratory: 89, diabetes: 65 },
    alerts: 0,
    immunization: 56,
    color: "#5EEAD4",
  },
  sabaragamuwa: {
    name: "Sabaragamuwa",
    hospitals: 35,
    doctors: 178,
    patients: 4120,
    cases: { dengue: 145, respiratory: 123, diabetes: 98 },
    alerts: 1,
    immunization: 63,
    color: "#99F6E4",
  },
};

// KPI Data
const kpis = [
  { label: "Total Facilities", value: "312", change: "+12", trend: "up", icon: Building2, color: "from-teal-500 to-cyan-500" },
  { label: "Active Doctors", value: "1,840", change: "+45", trend: "up", icon: Stethoscope, color: "from-blue-500 to-indigo-500" },
  { label: "Patients Today", value: "2,847", change: "+156", trend: "up", icon: Users, color: "from-emerald-500 to-green-500" },
  { label: "Active Alerts", value: "5", change: "-2", trend: "down", icon: Bell, color: "from-rose-500 to-red-500" },
];

// Disease tracking
const diseaseData = [
  { name: "Dengue", cases: 1601, trend: "+12%", icon: Droplets, color: "text-rose-500", bgColor: "bg-rose-100" },
  { name: "Respiratory", cases: 1366, trend: "+8%", icon: Wind, color: "text-amber-500", bgColor: "bg-amber-100" },
  { name: "Diabetes", cases: 993, trend: "-3%", icon: Thermometer, color: "text-blue-500", bgColor: "bg-blue-100" },
];

// Active alerts
const alerts = [
  { title: "Dengue outbreak advisory", province: "Western", district: "Gampaha", severity: "high", cases: 89 },
  { title: "Dengue cases rising", province: "Eastern", district: "Batticaloa", severity: "high", cases: 67 },
  { title: "Respiratory infection cluster", province: "Southern", district: "Galle", severity: "medium", cases: 45 },
  { title: "Heatwave health guidance", province: "Eastern", district: "Ampara", severity: "medium", cases: 0 },
  { title: "Vaccination drive reminder", province: "Sabaragamuwa", district: "Ratnapura", severity: "info", cases: 0 },
];

// Hospital hotspots
const hospitalHotspots = [
  { name: "National Hospital", province: "western", x: 28, y: 58, patients: 456 },
  { name: "Teaching Hospital Kandy", province: "central", x: 45, y: 48, patients: 312 },
  { name: "Teaching Hospital Jaffna", province: "northern", x: 45, y: 8, patients: 198 },
  { name: "Karapitiya Hospital", province: "southern", x: 35, y: 78, patients: 234 },
  { name: "Batticaloa Hospital", province: "eastern", x: 68, y: 42, patients: 156 },
];

// Sri Lanka Map SVG Component
function SriLankaMap({
  selectedProvince,
  onProvinceSelect
}: {
  selectedProvince: string | null;
  onProvinceSelect: (province: string | null) => void;
}) {
  return (
    <svg viewBox="0 0 100 120" className="w-full h-full">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.2" />
        </filter>
        <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14B8A6" />
          <stop offset="100%" stopColor="#0D9488" />
        </linearGradient>
      </defs>

      {/* Northern Province */}
      <path
        d="M35 5 Q50 2 60 8 L65 15 Q62 22 55 25 L50 28 Q42 30 38 25 L32 18 Q30 12 35 5"
        fill={selectedProvince === "northern" ? "#0D9488" : provinceData.northern.alerts > 0 ? "#FEE2E2" : "#E0F2F1"}
        stroke="#0D9488"
        strokeWidth="0.5"
        className="cursor-pointer hover:opacity-80 transition-all"
        onClick={() => onProvinceSelect(selectedProvince === "northern" ? null : "northern")}
      />
      <text x="48" y="16" fontSize="4" fill="#0F766E" className="pointer-events-none font-medium">N</text>

      {/* North Central Province */}
      <path
        d="M38 25 L50 28 Q55 25 55 30 L58 38 Q55 45 48 45 L40 42 Q35 38 35 32 Q35 28 38 25"
        fill={selectedProvince === "northcentral" ? "#0D9488" : provinceData.northcentral.alerts > 0 ? "#FEE2E2" : "#D1FAE5"}
        stroke="#0D9488"
        strokeWidth="0.5"
        className="cursor-pointer hover:opacity-80 transition-all"
        onClick={() => onProvinceSelect(selectedProvince === "northcentral" ? null : "northcentral")}
      />
      <text x="44" y="36" fontSize="4" fill="#0F766E" className="pointer-events-none font-medium">NC</text>

      {/* North Western Province */}
      <path
        d="M20 30 Q28 28 35 32 Q35 38 32 42 L28 50 Q22 52 18 48 L15 40 Q15 32 20 30"
        fill={selectedProvince === "northwestern" ? "#0D9488" : provinceData.northwestern.alerts > 0 ? "#FEE2E2" : "#CCFBF1"}
        stroke="#0D9488"
        strokeWidth="0.5"
        className="cursor-pointer hover:opacity-80 transition-all"
        onClick={() => onProvinceSelect(selectedProvince === "northwestern" ? null : "northwestern")}
      />
      <text x="22" y="42" fontSize="4" fill="#0F766E" className="pointer-events-none font-medium">NW</text>

      {/* Eastern Province */}
      <path
        d="M55 30 L65 28 Q72 32 75 42 L72 55 Q68 62 62 60 L55 55 Q52 48 55 38 L55 30"
        fill={selectedProvince === "eastern" ? "#0D9488" : provinceData.eastern.alerts > 0 ? "#FEE2E2" : "#FEF3C7"}
        stroke="#0D9488"
        strokeWidth="0.5"
        className="cursor-pointer hover:opacity-80 transition-all"
        onClick={() => onProvinceSelect(selectedProvince === "eastern" ? null : "eastern")}
      />
      <text x="62" y="45" fontSize="4" fill="#0F766E" className="pointer-events-none font-medium">E</text>

      {/* Central Province */}
      <path
        d="M32 42 L40 42 L48 45 L55 45 L55 55 L52 62 Q48 65 42 65 L35 62 Q30 58 28 52 L32 42"
        fill={selectedProvince === "central" ? "#0D9488" : provinceData.central.alerts > 0 ? "#FEE2E2" : "#A7F3D0"}
        stroke="#0D9488"
        strokeWidth="0.5"
        className="cursor-pointer hover:opacity-80 transition-all"
        onClick={() => onProvinceSelect(selectedProvince === "central" ? null : "central")}
      />
      <text x="40" y="54" fontSize="4" fill="#0F766E" className="pointer-events-none font-medium">C</text>

      {/* Western Province */}
      <path
        d="M18 48 L28 50 L28 52 Q30 58 28 65 L25 72 Q20 75 15 70 L12 60 Q12 52 18 48"
        fill={selectedProvince === "western" ? "#0D9488" : provinceData.western.alerts > 0 ? "#FEE2E2" : "#99F6E4"}
        stroke="#0D9488"
        strokeWidth="0.5"
        className="cursor-pointer hover:opacity-80 transition-all"
        onClick={() => onProvinceSelect(selectedProvince === "western" ? null : "western")}
      />
      <text x="18" y="62" fontSize="4" fill="#0F766E" className="pointer-events-none font-medium">W</text>

      {/* Sabaragamuwa Province */}
      <path
        d="M28 65 L35 62 L42 65 L45 72 Q42 78 35 78 L28 75 Q25 72 28 65"
        fill={selectedProvince === "sabaragamuwa" ? "#0D9488" : provinceData.sabaragamuwa.alerts > 0 ? "#FEE2E2" : "#6EE7B7"}
        stroke="#0D9488"
        strokeWidth="0.5"
        className="cursor-pointer hover:opacity-80 transition-all"
        onClick={() => onProvinceSelect(selectedProvince === "sabaragamuwa" ? null : "sabaragamuwa")}
      />
      <text x="33" y="72" fontSize="4" fill="#0F766E" className="pointer-events-none font-medium">SA</text>

      {/* Uva Province */}
      <path
        d="M52 62 L55 55 L62 60 Q65 65 62 72 L55 75 Q50 72 48 68 L52 62"
        fill={selectedProvince === "uva" ? "#0D9488" : provinceData.uva.alerts > 0 ? "#FEE2E2" : "#34D399"}
        stroke="#0D9488"
        strokeWidth="0.5"
        className="cursor-pointer hover:opacity-80 transition-all"
        onClick={() => onProvinceSelect(selectedProvince === "uva" ? null : "uva")}
      />
      <text x="54" y="66" fontSize="4" fill="#0F766E" className="pointer-events-none font-medium">U</text>

      {/* Southern Province */}
      <path
        d="M25 72 L28 75 L35 78 L45 72 L48 68 L55 75 Q58 82 52 88 L42 92 Q32 92 25 85 Q20 80 25 72"
        fill={selectedProvince === "southern" ? "#0D9488" : provinceData.southern.alerts > 0 ? "#FEE2E2" : "#10B981"}
        stroke="#0D9488"
        strokeWidth="0.5"
        className="cursor-pointer hover:opacity-80 transition-all"
        onClick={() => onProvinceSelect(selectedProvince === "southern" ? null : "southern")}
      />
      <text x="38" y="84" fontSize="4" fill="#fff" className="pointer-events-none font-medium">S</text>

      {/* Hospital markers */}
      {hospitalHotspots.map((hospital) => (
        <g key={hospital.name}>
          <circle
            cx={hospital.x}
            cy={hospital.y}
            r="2.5"
            fill="#EF4444"
            className="animate-pulse"
          />
          <circle
            cx={hospital.x}
            cy={hospital.y}
            r="1.5"
            fill="#fff"
          />
        </g>
      ))}

      {/* Legend indicator for Colombo */}
      <circle cx="22" cy="58" r="3" fill="#0D9488" stroke="#fff" strokeWidth="0.5" />
      <text x="22" y="59" fontSize="3" fill="#fff" textAnchor="middle" className="pointer-events-none">C</text>
    </svg>
  );
}

// Province Stats Card Component
function ProvinceStatsCard({ province }: { province: string }) {
  const data = provinceData[province];
  if (!data) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-slate-900">{data.name} Province</h4>
        {data.alerts > 0 && (
          <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs rounded-full flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {data.alerts} Alert{data.alerts > 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-2 bg-teal-50 rounded-lg">
          <p className="text-xs text-teal-600">Hospitals</p>
          <p className="text-lg font-bold text-teal-700">{data.hospitals}</p>
        </div>
        <div className="p-2 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-600">Doctors</p>
          <p className="text-lg font-bold text-blue-700">{data.doctors}</p>
        </div>
        <div className="p-2 bg-emerald-50 rounded-lg">
          <p className="text-xs text-emerald-600">Patients Today</p>
          <p className="text-lg font-bold text-emerald-700">{data.patients.toLocaleString()}</p>
        </div>
        <div className="p-2 bg-purple-50 rounded-lg">
          <p className="text-xs text-purple-600">Immunization</p>
          <p className="text-lg font-bold text-purple-700">{data.immunization}%</p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-100">
        <p className="text-xs text-slate-500 mb-2">Active Cases</p>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs rounded-full">
            Dengue: {data.cases.dengue}
          </span>
          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
            Resp: {data.cases.respiratory}
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
            Diabetes: {data.cases.diabetes}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function SupervisorOverviewPage() {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  // Calculate totals
  const totalHospitals = Object.values(provinceData).reduce((sum, p) => sum + p.hospitals, 0);
  const totalDoctors = Object.values(provinceData).reduce((sum, p) => sum + p.doctors, 0);
  const totalPatients = Object.values(provinceData).reduce((sum, p) => sum + p.patients, 0);
  const totalAlerts = Object.values(provinceData).reduce((sum, p) => sum + p.alerts, 0);
  const totalDengue = Object.values(provinceData).reduce((sum, p) => sum + p.cases.dengue, 0);
  const totalRespiratory = Object.values(provinceData).reduce((sum, p) => sum + p.cases.respiratory, 0);
  const totalDiabetes = Object.values(provinceData).reduce((sum, p) => sum + p.cases.diabetes, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sri Lanka Health Dashboard</h1>
          <p className="text-slate-500 mt-1">Real-time healthcare monitoring across 9 provinces</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live Data
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 text-teal-700 rounded-lg text-sm">
            <Activity className="h-4 w-4" />
            Last updated: Just now
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Facilities", value: totalHospitals.toString(), change: "+12", trend: "up", icon: Building2, color: "from-teal-500 to-cyan-500" },
          { label: "Active Doctors", value: totalDoctors.toLocaleString(), change: "+45", trend: "up", icon: Stethoscope, color: "from-blue-500 to-indigo-500" },
          { label: "Patients Today", value: totalPatients.toLocaleString(), change: "+2.3k", trend: "up", icon: Users, color: "from-emerald-500 to-green-500" },
          { label: "Active Alerts", value: totalAlerts.toString(), change: "-2", trend: "down", icon: Bell, color: "from-rose-500 to-red-500" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className={`flex items-center gap-1 text-xs font-medium ${item.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {item.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {item.change}
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900">{item.value}</div>
                <div className="text-xs text-slate-500">{item.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content - Map and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Healthcare Coverage Map</h3>
              <p className="text-sm text-slate-500">Click on a province to view details</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-teal-500"></span> Normal
              </span>
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-rose-200"></span> Alert
              </span>
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-red-500"></span> Hospital
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Map */}
            <div className="relative h-[400px] flex items-center justify-center">
              <SriLankaMap
                selectedProvince={selectedProvince}
                onProvinceSelect={setSelectedProvince}
              />
            </div>

            {/* Province Details or Summary */}
            <div className="space-y-4">
              {selectedProvince ? (
                <ProvinceStatsCard province={selectedProvince} />
              ) : (
                <>
                  <div className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl p-4 text-white">
                    <h4 className="font-bold mb-3">National Summary</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-2xl font-bold">{totalHospitals}</p>
                        <p className="text-teal-100 text-xs">Hospitals</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{totalDoctors.toLocaleString()}</p>
                        <p className="text-teal-100 text-xs">Doctors</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{totalPatients.toLocaleString()}</p>
                        <p className="text-teal-100 text-xs">Patients Today</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">68%</p>
                        <p className="text-teal-100 text-xs">Avg Immunization</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-slate-500 text-center p-4 bg-slate-50 rounded-lg">
                    <MapPin className="h-5 w-5 mx-auto mb-2 text-slate-400" />
                    Click on any province to view detailed statistics
                  </div>
                </>
              )}

              {/* Province List */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Province Overview</h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {Object.entries(provinceData).map(([key, data]) => (
                    <div
                      key={key}
                      onClick={() => setSelectedProvince(selectedProvince === key ? null : key)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                        selectedProvince === key ? 'bg-teal-100 border border-teal-300' : 'bg-white hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${data.alerts > 0 ? 'bg-rose-500' : 'bg-teal-500'}`}></span>
                        <span className="text-sm font-medium text-slate-700">{data.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{data.hospitals} hosp</span>
                        <span>{data.patients.toLocaleString()} pts</span>
                        {data.alerts > 0 && (
                          <span className="px-1.5 py-0.5 bg-rose-100 text-rose-600 rounded">
                            {data.alerts}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Disease Stats */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Disease Tracking</h3>
              <span className="text-xs text-slate-500">Nationwide</span>
            </div>
            <div className="space-y-4">
              {[
                { name: "Dengue", cases: totalDengue, trend: "+12%", icon: Droplets, color: "text-rose-500", bgColor: "bg-rose-100", barColor: "bg-rose-500" },
                { name: "Respiratory", cases: totalRespiratory, trend: "+8%", icon: Wind, color: "text-amber-500", bgColor: "bg-amber-100", barColor: "bg-amber-500" },
                { name: "Diabetes", cases: totalDiabetes, trend: "-3%", icon: Thermometer, color: "text-blue-500", bgColor: "bg-blue-100", barColor: "bg-blue-500" },
              ].map((disease) => {
                const Icon = disease.icon;
                const maxCases = Math.max(totalDengue, totalRespiratory, totalDiabetes);
                const percentage = (disease.cases / maxCases) * 100;
                return (
                  <div key={disease.name}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-lg ${disease.bgColor} flex items-center justify-center`}>
                          <Icon className={`h-4 w-4 ${disease.color}`} />
                        </div>
                        <span className="text-sm font-medium text-slate-700">{disease.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900">{disease.cases.toLocaleString()}</span>
                        <span className={`text-xs ml-2 ${disease.trend.startsWith('+') ? 'text-rose-500' : 'text-green-500'}`}>
                          {disease.trend}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${disease.barColor} rounded-full transition-all`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Alerts */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Active Alerts</h3>
              <span className="h-6 w-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold">
                {alerts.length}
              </span>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.severity === 'high' ? 'bg-rose-50 border-rose-500' :
                    alert.severity === 'medium' ? 'bg-amber-50 border-amber-500' :
                    'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                      alert.severity === 'high' ? 'text-rose-500' :
                      alert.severity === 'medium' ? 'text-amber-500' :
                      'text-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{alert.title}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {alert.district}, {alert.province}
                      </p>
                      {alert.cases > 0 && (
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-white/50 rounded">
                          {alert.cases} cases
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Immunization by Province */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Immunization Coverage</h3>
            <span className="text-xs text-slate-500">By Province</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(provinceData)
              .sort((a, b) => b[1].immunization - a[1].immunization)
              .slice(0, 6)
              .map(([key, data]) => (
                <div key={key} className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-lg font-bold text-teal-600">{data.immunization}%</div>
                  <div className="text-xs text-slate-500">{data.name}</div>
                  <div className="mt-2 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full"
                      style={{ width: `${data.immunization}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Today's Summary */}
        <div className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl p-5 text-white">
          <h3 className="font-bold mb-4">Today's Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-teal-100 text-sm">Patients Served</span>
              <span className="font-bold">{totalPatients.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-teal-100 text-sm">Satisfaction Rate</span>
              <span className="font-bold">98.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-teal-100 text-sm">Avg Wait Time</span>
              <span className="font-bold">18 min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-teal-100 text-sm">Emergencies</span>
              <span className="font-bold">156</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-3 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg transition-colors">
              <span className="text-sm font-medium">View All Reports</span>
              <ChevronRight className="h-4 w-4" />
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors">
              <span className="text-sm font-medium">Download Data</span>
              <ChevronRight className="h-4 w-4" />
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors">
              <span className="text-sm font-medium">Alert Settings</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
