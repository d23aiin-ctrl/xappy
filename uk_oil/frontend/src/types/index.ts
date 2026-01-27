// User Types
export type UserRole =
  | "worker"
  | "contractor"
  | "supervisor"
  | "site_manager"
  | "hse_manager"
  | "hse_officer"
  | "compliance_officer"
  | "operations_director"
  | "admin"
  | "super_admin";

export type UserStatus = "pending" | "active" | "suspended" | "inactive";

export interface User {
  id: string;
  badge_number: string;
  phone_number?: string;
  email?: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  site_id?: string;
  shift_pattern?: string;
  department?: string;
  created_at: string;
  updated_at: string;
}

// Site Types
export type SiteType =
  | "refinery"
  | "platform"
  | "terminal"
  | "pipeline"
  | "storage"
  | "drilling"
  | "processing"
  | "distribution";

export interface Site {
  id: string;
  code: string;
  name: string;
  site_type: SiteType;
  location: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
  created_at: string;
}

export type HazardClassification =
  | "zone_0"
  | "zone_1"
  | "zone_2"
  | "non_hazardous";

export interface Area {
  id: string;
  site_id: string;
  code: string;
  name: string;
  hazard_classification: HazardClassification;
  description?: string;
  parent_area_id?: string;
  is_active: boolean;
}

// Report Types
export type ReportType =
  | "near_miss"
  | "incident"
  | "daily_safety_log"
  | "shift_handover"
  | "toolbox_talk"
  | "ptw_evidence"
  | "loto_evidence"
  | "spill_report"
  | "inspection";

export type ReportStatus =
  | "submitted"
  | "acknowledged"
  | "under_review"
  | "in_progress"
  | "escalated"
  | "resolved"
  | "closed"
  | "rejected";

export type ReportSource = "whatsapp" | "sms" | "voice" | "web" | "mobile_app";

export interface Report {
  id: string;
  reference_number: string;
  report_type: ReportType;
  title: string;
  description: string;
  status: ReportStatus;
  reporter_id: string;
  reporter?: User;
  site_id: string;
  site?: Site;
  area_id?: string;
  area?: Area;
  location_description?: string;
  location_coordinates?: { lat: number; lng: number };
  source: ReportSource;
  reported_at: string;
  acknowledged_at?: string;
  acknowledged_by_id?: string;
  resolved_at?: string;
  resolved_by_id?: string;
  ai_classification?: Record<string, any>;
  ai_summary?: string;
  ai_recommendations?: string[];
  created_at: string;
  updated_at: string;
}

// Near-Miss Types
export type NearMissCategory =
  | "slip_trip_fall"
  | "falling_object"
  | "equipment_failure"
  | "chemical_exposure"
  | "fire_explosion_risk"
  | "electrical_hazard"
  | "confined_space"
  | "vehicle_incident"
  | "ergonomic"
  | "environmental"
  | "process_safety"
  | "security"
  | "other";

export type SeverityLevel = "low" | "medium" | "high" | "critical";

export interface NearMissDetails {
  id: string;
  report_id: string;
  category: NearMissCategory;
  potential_severity: SeverityLevel;
  equipment_involved?: string[];
  weather_conditions?: string;
  time_of_occurrence?: string;
  witnesses?: string[];
  immediate_actions_taken?: string;
  root_cause_preliminary?: string;
  contributing_factors?: string[];
  recommendations?: string;
  follow_up_required: boolean;
  follow_up_assigned_to_id?: string;
}

export interface NearMissReport extends Report {
  details: NearMissDetails;
}

// Incident Types
export type IncidentType =
  | "injury"
  | "property_damage"
  | "fire"
  | "explosion"
  | "chemical_release"
  | "environmental"
  | "vehicle_accident"
  | "security_breach"
  | "near_miss_escalated"
  | "fatality"
  | "other";

export interface IncidentDetails {
  id: string;
  report_id: string;
  incident_type: IncidentType;
  severity_level: SeverityLevel;
  injuries_count: number;
  fatalities_count: number;
  injury_description?: string;
  property_damage_estimate?: number;
  environmental_impact?: string;
  equipment_involved?: string[];
  emergency_response_taken?: string;
  immediate_actions?: string;
  witnesses?: string[];
  regulatory_reportable: boolean;
  regulatory_agency?: string;
  investigation_required: boolean;
  investigation_lead_id?: string;
  root_cause_analysis?: string;
  corrective_actions?: string[];
}

export interface IncidentReport extends Report {
  details: IncidentDetails;
}

// Shift Handover Types
export interface ShiftHandoverDetails {
  id: string;
  report_id: string;
  outgoing_shift: string;
  incoming_shift: string;
  outgoing_supervisor_id: string;
  incoming_supervisor_id?: string;
  voice_recording_url?: string;
  voice_duration_seconds?: number;
  transcription?: string;
  transcription_language?: string;
  key_activities_completed?: string[];
  pending_tasks?: string[];
  safety_concerns?: string[];
  equipment_status?: Record<string, any>;
  personnel_on_shift?: number;
  handover_accepted: boolean;
  accepted_at?: string;
}

export interface ShiftHandoverReport extends Report {
  details: ShiftHandoverDetails;
}

// Toolbox Talk Types
export interface ToolboxTalkDetails {
  id: string;
  report_id: string;
  topic: string;
  topic_category?: string;
  presenter_id: string;
  duration_minutes: number;
  attendees_count: number;
  attendee_ids?: string[];
  attendance_photo_url?: string;
  key_points_discussed?: string[];
  hazards_discussed?: string[];
  safety_reminders?: string[];
  questions_raised?: string[];
  action_items?: string[];
  materials_used?: string[];
}

export interface ToolboxTalkReport extends Report {
  details: ToolboxTalkDetails;
}

// Media Attachment Types
export type MediaType = "image" | "video" | "audio" | "document";

export interface MediaAttachment {
  id: string;
  report_id: string;
  media_type: MediaType;
  file_url: string;
  file_name: string;
  file_size_bytes: number;
  mime_type: string;
  file_hash: string;
  thumbnail_url?: string;
  description?: string;
  captured_at?: string;
  location_coordinates?: { lat: number; lng: number };
  is_evidence: boolean;
  created_at: string;
}

// Audit Trail Types
export type AuditAction =
  | "created"
  | "updated"
  | "status_changed"
  | "acknowledged"
  | "escalated"
  | "resolved"
  | "closed"
  | "reopened"
  | "attachment_added"
  | "comment_added"
  | "assigned"
  | "exported";

export interface AuditTrail {
  id: string;
  report_id: string;
  action: AuditAction;
  action_by_id: string;
  action_by?: User;
  previous_value?: Record<string, any>;
  new_value?: Record<string, any>;
  notes?: string;
  ip_address?: string;
  user_agent?: string;
  previous_hash?: string;
  entry_hash: string;
  created_at: string;
}

// Dashboard Stats Types
export interface StatCard {
  title: string;
  value: number;
  change?: number;
  change_period: string;
}

export interface SupervisorStats {
  total_reports_today: StatCard;
  pending_acknowledgment: StatCard;
  near_miss_this_week: StatCard;
  incidents_this_month: StatCard;
  reports_by_type: { category: string; count: number }[];
  recent_reports: Report[];
}

export interface HSEStats {
  total_reports: StatCard;
  open_incidents: StatCard;
  near_miss_rate: StatCard;
  compliance_score: StatCard;
  reports_by_site: { site: string; count: number }[];
  severity_distribution: { severity: string; count: number }[];
  monthly_trends: { month: string; near_miss: number; incident: number }[];
}

// Pagination Types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}
