"use client";

import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Building2,
  ChevronRight,
  Clock,
  TrendingDown,
  TrendingUp,
  Users,
  CheckCircle2,
  XCircle,
  Wrench,
  HardHat,
  ClipboardCheck,
  Cloud,
  Sun,
  Wind,
  Droplets,
  Shield,
  Calendar,
  FileText,
} from "lucide-react";

// Project data
const projectData = [
  {
    id: "1",
    name: "Skyline Towers",
    type: "Residential Society",
    progress: 78,
    status: "on_schedule",
    towers: 3,
    units: 450,
    workers: 156,
    defects: 12,
  },
  {
    id: "2",
    name: "Metro Business Park",
    type: "Commercial Office",
    progress: 45,
    status: "delayed",
    towers: 2,
    units: 120,
    workers: 89,
    defects: 8,
  },
  {
    id: "3",
    name: "Palm Villas",
    type: "Residential Villa",
    progress: 92,
    status: "ahead",
    towers: 0,
    units: 24,
    workers: 34,
    defects: 3,
  },
  {
    id: "4",
    name: "Central Mall",
    type: "Commercial Mall",
    progress: 65,
    status: "on_schedule",
    towers: 1,
    units: 85,
    workers: 112,
    defects: 15,
  },
];

// Recent reports
const recentReports = [
  { id: "1", type: "Construction Progress", title: "Tower A - 5th Floor Complete", time: "2 hours ago", status: "submitted" },
  { id: "2", type: "Defect", title: "Water leakage in Unit 1201", time: "3 hours ago", status: "open" },
  { id: "3", type: "Safety Incident", title: "Minor scaffolding incident", time: "5 hours ago", status: "under_review" },
  { id: "4", type: "Inspection", title: "MEP inspection - Podium", time: "Yesterday", status: "closed" },
  { id: "5", type: "Construction Progress", title: "Tower B - Foundation complete", time: "Yesterday", status: "acknowledged" },
];

// Active alerts
const alerts = [
  { title: "Material delivery delayed", project: "Skyline Towers", severity: "high", time: "1 hour ago" },
  { title: "Safety inspection due", project: "Metro Business Park", severity: "medium", time: "Today" },
  { title: "Defect closure pending", project: "Palm Villas", severity: "low", time: "2 days overdue" },
];

// Weather data (simulated - would come from weather API)
const weatherData = {
  condition: "Partly Cloudy",
  temperature: 28,
  humidity: 65,
  wind: 12,
  icon: "cloud-sun",
  forecast: [
    { day: "Today", high: 30, low: 22, condition: "sunny" },
    { day: "Tomorrow", high: 28, low: 21, condition: "cloudy" },
    { day: "Wed", high: 26, low: 20, condition: "rain" },
  ],
  workSafe: true,
  alerts: [] as string[],
};

// Safety metrics
const safetyMetrics = {
  daysWithoutIncident: 45,
  totalIncidents: 2,
  nearMisses: 5,
  safetyScore: 96,
  inspectionsDue: 3,
  certificationExpiring: 2,
};

// Today's schedule
const todaySchedule = [
  { time: "09:00 AM", task: "MEP Inspection - Tower A", type: "inspection", project: "Skyline Towers" },
  { time: "11:00 AM", task: "Concrete Pour - Level 6", type: "milestone", project: "Metro Business Park" },
  { time: "02:00 PM", task: "Safety Toolbox Talk", type: "meeting", project: "All Sites" },
  { time: "04:00 PM", task: "Defect Verification Walk", type: "inspection", project: "Palm Villas" },
];

export default function SupervisorOverviewPage() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Calculate totals
  const totalWorkers = projectData.reduce((sum, p) => sum + p.workers, 0);
  const totalDefects = projectData.reduce((sum, p) => sum + p.defects, 0);
  const avgProgress = Math.round(projectData.reduce((sum, p) => sum + p.progress, 0) / projectData.length);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      on_schedule: { color: "bg-emerald-100 text-emerald-700", label: "On Schedule" },
      ahead: { color: "bg-blue-100 text-blue-700", label: "Ahead" },
      delayed: { color: "bg-amber-100 text-amber-700", label: "Delayed" },
      critical: { color: "bg-red-100 text-red-700", label: "Critical" },
    };
    const badge = badges[status] || badges.on_schedule;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>{badge.label}</span>;
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 80) return "bg-emerald-500";
    if (percent >= 60) return "bg-blue-500";
    if (percent >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

  const getReportStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: React.ReactNode }> = {
      submitted: { color: "bg-blue-100 text-blue-700", icon: <Clock className="w-3 h-3" /> },
      open: { color: "bg-red-100 text-red-700", icon: <XCircle className="w-3 h-3" /> },
      under_review: { color: "bg-amber-100 text-amber-700", icon: <Activity className="w-3 h-3" /> },
      acknowledged: { color: "bg-purple-100 text-purple-700", icon: <CheckCircle2 className="w-3 h-3" /> },
      closed: { color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 className="w-3 h-3" /> },
    };
    const badge = badges[status] || badges.submitted;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.icon}
        {status.replace("_", " ")}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Project Dashboard</h1>
          <p className="text-slate-500 mt-1">Real-time construction monitoring across all projects</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live Data
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
            <Activity className="h-4 w-4" />
            Last updated: Just now
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Projects", value: projectData.length.toString(), change: "+1", trend: "up", icon: Building2, color: "from-blue-500 to-blue-600" },
          { label: "Workers Today", value: totalWorkers.toLocaleString(), change: "+23", trend: "up", icon: HardHat, color: "from-blue-500 to-indigo-500" },
          { label: "Open Defects", value: totalDefects.toString(), change: "-5", trend: "down", icon: AlertTriangle, color: "from-amber-500 to-orange-500" },
          { label: "Avg Progress", value: `${avgProgress}%`, change: "+3%", trend: "up", icon: TrendingUp, color: "from-emerald-500 to-green-500" },
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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Active Projects</h3>
              <p className="text-sm text-slate-500">Click on a project to view details</p>
            </div>
          </div>

          <div className="space-y-4">
            {projectData.map((project) => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedProject === project.id ? 'border-blue-300 bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{project.name}</h4>
                      <p className="text-xs text-slate-500">{project.type}</p>
                    </div>
                  </div>
                  {getStatusBadge(project.status)}
                </div>

                <div className="flex items-center gap-6 text-sm text-slate-600 mb-3">
                  {project.towers > 0 && (
                    <span className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {project.towers} Towers
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <ClipboardCheck className="w-4 h-4" />
                    {project.units} Units
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {project.workers} Workers
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {project.defects} Defects
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(project.progress)} transition-all`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-900 w-12">{project.progress}%</span>
                </div>

                {selectedProject === project.id && (
                  <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-500">This Week's Progress</p>
                      <p className="text-lg font-bold text-blue-600">+5%</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-500">Reports Today</p>
                      <p className="text-lg font-bold text-blue-600">8</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-500">Defects Closed</p>
                      <p className="text-lg font-bold text-emerald-600">3</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-500">Inspections Due</p>
                      <p className="text-lg font-bold text-amber-600">2</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Recent Reports */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Recent Reports</h3>
              <a href="/supervisor/reports" className="text-xs text-blue-600 hover:text-blue-700">View all</a>
            </div>
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div key={report.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-slate-500">{report.type}</span>
                      {getReportStatusBadge(report.status)}
                    </div>
                    <p className="text-sm font-medium text-slate-900 truncate">{report.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{report.time}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Active Alerts */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Active Alerts</h3>
              <span className="h-6 w-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold">
                {alerts.length}
              </span>
            </div>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.severity === 'high' ? 'bg-red-50 border-red-500' :
                    alert.severity === 'medium' ? 'bg-amber-50 border-amber-500' :
                    'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                      alert.severity === 'high' ? 'text-red-500' :
                      alert.severity === 'medium' ? 'text-amber-500' :
                      'text-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{alert.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{alert.project}</p>
                      <p className="text-xs text-slate-400 mt-1">{alert.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <a href="/supervisor/progress" className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors">
                <span className="text-sm font-medium">Log Progress</span>
                <ChevronRight className="h-4 w-4" />
              </a>
              <a href="/supervisor/defects" className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors">
                <span className="text-sm font-medium">Report Defect</span>
                <ChevronRight className="h-4 w-4" />
              </a>
              <a href="/supervisor/chat" className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors">
                <span className="text-sm font-medium">Chat Assistant</span>
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row - Weather, Safety, Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Weather Widget */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Site Weather</h3>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${weatherData.workSafe ? 'bg-emerald-400/20 text-emerald-100' : 'bg-red-400/20 text-red-100'}`}>
              {weatherData.workSafe ? 'Work Safe' : 'Weather Alert'}
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-xl bg-white/20 flex items-center justify-center">
              <Sun className="h-8 w-8" />
            </div>
            <div>
              <div className="text-4xl font-bold">{weatherData.temperature}°C</div>
              <div className="text-blue-100">{weatherData.condition}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <Droplets className="h-4 w-4 mx-auto mb-1 text-blue-200" />
              <div className="text-xs text-blue-200">Humidity</div>
              <div className="font-semibold">{weatherData.humidity}%</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <Wind className="h-4 w-4 mx-auto mb-1 text-blue-200" />
              <div className="text-xs text-blue-200">Wind</div>
              <div className="font-semibold">{weatherData.wind} km/h</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <Cloud className="h-4 w-4 mx-auto mb-1 text-blue-200" />
              <div className="text-xs text-blue-200">Tomorrow</div>
              <div className="font-semibold">{weatherData.forecast[1].high}°C</div>
            </div>
          </div>
        </div>

        {/* Safety Metrics */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Safety Dashboard</h3>
            <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Shield className="h-4 w-4 text-emerald-600" />
            </div>
          </div>

          <div className="text-center mb-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="text-4xl font-bold text-emerald-600">{safetyMetrics.daysWithoutIncident}</div>
            <div className="text-sm text-emerald-700">Days Without Incident</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-xs text-slate-500">Near Misses</span>
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1">{safetyMetrics.nearMisses}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-slate-500">Safety Score</span>
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1">{safetyMetrics.safetyScore}%</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-500" />
                <span className="text-xs text-slate-500">Inspections Due</span>
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1">{safetyMetrics.inspectionsDue}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                <HardHat className="h-4 w-4 text-orange-500" />
                <span className="text-xs text-slate-500">Certs Expiring</span>
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1">{safetyMetrics.certificationExpiring}</div>
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Today&apos;s Schedule</h3>
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
          </div>

          <div className="space-y-3">
            {todaySchedule.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="text-xs font-medium text-slate-400 w-16 pt-1">{item.time}</div>
                <div className="flex-1">
                  <div className={`w-2 h-2 rounded-full inline-block mr-2 ${
                    item.type === 'inspection' ? 'bg-purple-500' :
                    item.type === 'milestone' ? 'bg-emerald-500' :
                    'bg-blue-500'
                  }`} />
                  <span className="text-sm font-medium text-slate-900">{item.task}</span>
                  <p className="text-xs text-slate-500 ml-4">{item.project}</p>
                </div>
              </div>
            ))}
          </div>

          <a href="/supervisor/inspections" className="mt-4 w-full flex items-center justify-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors text-sm">
            <Calendar className="h-4 w-4" />
            View Full Calendar
          </a>
        </div>
      </div>
    </div>
  );
}
