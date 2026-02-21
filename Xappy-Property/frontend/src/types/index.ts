// User Types
export type UserRole =
  | "worker"
  | "supervisor"
  | "site_manager"
  | "project_manager"
  | "contractor"
  | "architect"
  | "quality_inspector"
  | "safety_officer"
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
  | "residential_society"
  | "residential_villa"
  | "commercial_office"
  | "commercial_mall"
  | "mixed_use"
  | "hospitality";

export type AreaClassification =
  | "construction_zone"
  | "storage_area"
  | "office_area"
  | "common_area"
  | "restricted";

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

export interface Area {
  id: string;
  site_id: string;
  code: string;
  name: string;
  area_classification: AreaClassification;
  description?: string;
  parent_area_id?: string;
  is_active: boolean;
}

// Report Types
export type ReportType =
  | "construction_progress"
  | "defect_snag"
  | "safety_incident"
  | "site_inspection"
  | "daily_progress_log"
  | "shift_handover"
  | "toolbox_talk";

export type ReportStatus =
  | "submitted"
  | "acknowledged"
  | "under_review"
  | "in_progress"
  | "escalated"
  | "resolved"
  | "closed"
  | "rejected";

export type ReportSource = "web" | "mobile" | "api";

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

// Construction Progress Types
export type ProgressStatus = "on_schedule" | "ahead" | "delayed" | "critical_delay";

export type WeatherCondition = "sunny" | "cloudy" | "rainy" | "stormy" | "hot" | "windy";

export interface ConstructionProgressDetails {
  id: string;
  report_id: string;
  building_block?: string;
  floor_level?: string;
  planned_progress_percent?: number;
  actual_progress_percent?: number;
  progress_status: ProgressStatus;
  workers_present?: number;
  contractors_present?: number;
  activities_completed?: string[];
  activities_planned?: string[];
  delays_if_any?: string;
  delay_reason?: string;
  weather_conditions?: WeatherCondition;
  weather_impact?: string;
  materials_received?: { material: string; quantity: string; supplier: string }[];
  materials_used?: { material: string; quantity: string }[];
  equipment_on_site?: { name: string; status: string }[];
  safety_incidents: boolean;
  safety_notes?: string;
}

export interface ConstructionProgressReport extends Report {
  details: ConstructionProgressDetails;
}

// Defect Report Types
export type DefectCategory =
  | "structural"
  | "waterproofing"
  | "electrical"
  | "plumbing"
  | "finishing"
  | "carpentry"
  | "hvac"
  | "fire_safety"
  | "painting"
  | "flooring"
  | "glazing"
  | "other";

export type DefectPriority = "critical" | "high" | "medium" | "low";

export type DefectStatus =
  | "open"
  | "assigned"
  | "in_progress"
  | "pending_verification"
  | "closed"
  | "deferred";

export interface DefectReportDetails {
  id: string;
  report_id: string;
  category: DefectCategory;
  priority: DefectPriority;
  defect_status: DefectStatus;
  building_block?: string;
  floor_level?: string;
  unit_number?: string;
  room_area?: string;
  defect_description?: string;
  root_cause?: string;
  contractor_responsible?: string;
  assigned_to_id?: string;
  target_completion_date?: string;
  actual_completion_date?: string;
  days_open?: number;
  resolution_notes?: string;
  verified_by_id?: string;
  verified_at?: string;
  estimated_cost?: number;
  actual_cost?: number;
  is_recurring: boolean;
  related_defect_ids?: string[];
}

export interface DefectReport extends Report {
  details: DefectReportDetails;
}

// Incident Types
export type IncidentType =
  | "worker_injury"
  | "fall_from_height"
  | "scaffolding_collapse"
  | "equipment_accident"
  | "crane_incident"
  | "electrical_incident"
  | "material_fall"
  | "vehicle_incident"
  | "fire"
  | "property_damage"
  | "other";

export type SeverityLevel = "low" | "medium" | "high" | "critical";

export interface IncidentDetails {
  id: string;
  report_id: string;
  incident_type: IncidentType;
  severity_actual: SeverityLevel;
  injuries_count: number;
  fatalities_count: number;
  injury_description?: string;
  property_damage_estimate?: number;
  equipment_involved?: string[];
  emergency_response_taken?: string;
  immediate_actions?: string;
  witnesses?: string[];
  regulatory_reportable: boolean;
  investigation_required: boolean;
  investigation_lead_id?: string;
  root_cause_analysis?: string;
  corrective_actions?: string[];
}

export interface IncidentReport extends Report {
  details: IncidentDetails;
}

// Inspection Types
export type InspectionType =
  | "foundation_inspection"
  | "structural_inspection"
  | "mep_inspection"
  | "quality_audit"
  | "pre_handover"
  | "rera_compliance"
  | "safety_inspection"
  | "finishing_inspection"
  | "other";

export interface InspectionDetails {
  id: string;
  report_id: string;
  inspection_type: InspectionType;
  inspection_date?: string;
  inspector_id?: string;
  findings?: string[];
  recommendations?: string[];
  compliance_status?: string;
  follow_up_required: boolean;
}

export interface InspectionReport extends Report {
  details: InspectionDetails;
}

// Shift Handover Types
export interface ShiftHandoverDetails {
  id: string;
  report_id: string;
  outgoing_shift: string;
  incoming_shift: string;
  outgoing_supervisor_id: string;
  incoming_supervisor_id?: string;
  handover_time?: string;
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
  meeting_time?: string;
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
  progress_reports_this_week: StatCard;
  defects_this_month: StatCard;
  reports_by_type: { category: string; count: number }[];
  recent_reports: Report[];
}

export interface ProjectStats {
  total_reports_mtd: StatCard;
  open_defects: StatCard;
  defects_closed_this_week: StatCard;
  overall_progress: StatCard;
  defects_by_category: { category: string; count: number }[];
  defects_by_priority: { category: string; count: number }[];
  progress_trend: { date: string; count: number }[];
}

// Pagination Types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

// ============================================
// PROPERTY MANAGEMENT TYPES (Phase 2-3)
// ============================================

// Extended User Roles for Property Management
export type PropertyUserRole =
  | UserRole
  | "landlord"
  | "property_manager"
  | "agent"
  | "supplier"
  | "tenant";

// Property Types
export type PropertyType =
  | "flat"
  | "house"
  | "bungalow"
  | "maisonette"
  | "studio"
  | "room"
  | "hmo"
  | "commercial"
  | "mixed_use";

export type PropertyStatus =
  | "draft"
  | "available"
  | "let_agreed"
  | "let"
  | "unavailable"
  | "archived";

export type FurnishingType = "unfurnished" | "part_furnished" | "furnished";

export interface PropertyAddress {
  line1: string;
  line2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
}

export interface Property {
  id: string;
  reference: string;
  landlord_id: string;
  property_manager_id?: string;
  property_type: PropertyType;
  status: PropertyStatus;
  address: PropertyAddress;
  latitude?: number;
  longitude?: number;
  bedrooms: number;
  bathrooms: number;
  reception_rooms: number;
  floor_area_sqft?: number;
  furnishing: FurnishingType;
  parking_spaces: number;
  has_garden: boolean;
  has_balcony: boolean;
  pet_policy?: string;
  description?: string;
  features?: string[];
  rent_pcm: number;
  deposit_weeks: number;
  minimum_term_months: number;
  available_from?: string;
  epc_rating?: string;
  epc_expiry?: string;
  council_tax_band?: string;
  photos?: string[];
  floorplan_urls?: string[];
  virtual_tour_url?: string;
  is_hmo: boolean;
  hmo_licence_number?: string;
  hmo_licence_expiry?: string;
  created_at: string;
  updated_at: string;
}

// Tenant Pipeline Types
export type TenantPipelineStage =
  | "enquiry"
  | "viewing_scheduled"
  | "viewing_completed"
  | "application_started"
  | "qualification_pending"
  | "qualification_review"
  | "qualified"
  | "not_qualified"
  | "documents_requested"
  | "documents_submitted"
  | "documents_verified"
  | "holding_deposit_requested"
  | "holding_deposit_paid"
  | "referencing"
  | "referencing_passed"
  | "referencing_failed"
  | "contract_generated"
  | "contract_sent"
  | "contract_signed"
  | "move_in_scheduled"
  | "tenancy_started"
  | "withdrawn"
  | "rejected"
  | "archived";

export type TenantStatus = "prospect" | "active" | "past" | "blacklisted";

export interface TenantEmployment {
  employer_name?: string;
  job_title?: string;
  employment_type?: string;
  annual_income?: number;
  employment_start_date?: string;
}

export interface TenantGuarantor {
  name?: string;
  email?: string;
  phone?: string;
  relationship?: string;
  annual_income?: number;
}

export interface Tenant {
  id: string;
  user_id?: string;
  property_id?: string;
  status: TenantStatus;
  pipeline_stage: TenantPipelineStage;
  pipeline_stage_updated_at?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  nationality?: string;
  current_address?: PropertyAddress;
  employment: TenantEmployment;
  guarantor?: TenantGuarantor;
  has_pets: boolean;
  pet_details?: string;
  is_smoker: boolean;
  number_of_occupants: number;
  occupant_details?: string;
  preferred_move_in_date?: string;
  gdpr_consent_given: boolean;
  gdpr_consent_timestamp?: string;
  marketing_consent: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TenantPipelineHistory {
  id: string;
  tenant_id: string;
  from_stage: TenantPipelineStage;
  to_stage: TenantPipelineStage;
  triggered_by: string;
  triggered_by_user_id: string;
  override_reason?: string;
  notes?: string;
  created_at: string;
}

// Tenancy Types
export type TenancyStatus =
  | "draft"
  | "pending_signatures"
  | "active"
  | "periodic"
  | "ending"
  | "ended"
  | "terminated"
  | "cancelled";

export type TenancyType = "ast" | "non_housing_act" | "company_let" | "license";

export type DepositScheme = "dps" | "tds" | "mydeposits" | "other";

export interface Tenancy {
  id: string;
  reference: string;
  property_id: string;
  tenancy_type: TenancyType;
  status: TenancyStatus;
  start_date: string;
  end_date: string;
  rent_amount: number;
  rent_frequency: string;
  rent_due_day: number;
  deposit_amount: number;
  deposit_scheme?: DepositScheme;
  deposit_scheme_reference?: string;
  deposit_protected_date?: string;
  break_clause_months?: number;
  break_notice_period_days: number;
  notice_period_days: number;
  tenant_ids: string[];
  lead_tenant_id: string;
  tenancy_agreement_id?: string;
  special_terms?: string[];
  inventory_completed: boolean;
  inventory_date?: string;
  check_in_completed: boolean;
  check_in_date?: string;
  created_at: string;
  updated_at: string;
}

// Questionnaire Types
export type QuestionType =
  | "text"
  | "number"
  | "boolean"
  | "single_choice"
  | "multi_choice"
  | "date"
  | "file_upload"
  | "address"
  | "currency";

export type QuestionnaireStatus = "draft" | "active" | "archived";

export type ResponseStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "requires_more_info";

export interface QuestionnaireQuestion {
  id: string;
  questionnaire_id: string;
  question_text: string;
  question_type: QuestionType;
  help_text?: string;
  is_required: boolean;
  options?: string[];
  validation_rules?: Record<string, unknown>;
  scoring_weight: number;
  auto_fail_value?: unknown;
  order_index: number;
}

export interface Questionnaire {
  id: string;
  name: string;
  description?: string;
  status: QuestionnaireStatus;
  version: number;
  property_type?: PropertyType;
  passing_score: number;
  questions?: QuestionnaireQuestion[];
  created_by_id: string;
  created_at: string;
  updated_at: string;
}

export interface QualificationResponse {
  id: string;
  tenant_id: string;
  questionnaire_id: string;
  property_id?: string;
  status: ResponseStatus;
  responses: Record<string, unknown>;
  total_score?: number;
  passed?: boolean;
  auto_failed: boolean;
  auto_fail_reasons?: string[];
  submitted_at?: string;
  reviewed_by_id?: string;
  reviewed_at?: string;
  reviewer_notes?: string;
  created_at: string;
  updated_at: string;
}

// Document Types
export type DocumentType =
  | "passport"
  | "driving_licence"
  | "national_id"
  | "biometric_residence_permit"
  | "visa"
  | "utility_bill"
  | "bank_statement"
  | "council_tax_bill"
  | "payslip"
  | "employment_contract"
  | "tax_return"
  | "company_accounts"
  | "employer_reference"
  | "landlord_reference"
  | "character_reference"
  | "proof_of_benefits"
  | "other";

export type DocumentStatus =
  | "requested"
  | "uploaded"
  | "pending_review"
  | "verified"
  | "rejected"
  | "expired"
  | "gdpr_deleted";

export interface TenantDocument {
  id: string;
  tenant_id: string;
  document_type: DocumentType;
  status: DocumentStatus;
  file_name: string;
  file_size_bytes: number;
  mime_type: string;
  s3_key: string;
  s3_bucket: string;
  file_hash: string;
  is_encrypted: boolean;
  virus_scanned: boolean;
  virus_scan_result?: string;
  expiry_date?: string;
  verified_by_id?: string;
  verified_at?: string;
  rejection_reason?: string;
  gdpr_consent_given: boolean;
  gdpr_consent_timestamp?: string;
  gdpr_retention_until?: string;
  gdpr_deletion_requested: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentAccessLog {
  id: string;
  document_id: string;
  accessed_by_id: string;
  access_type: string;
  ip_address?: string;
  user_agent?: string;
  access_reason?: string;
  previous_hash?: string;
  entry_hash: string;
  created_at: string;
}

// Holding Deposit Types
export type HoldingDepositStatus =
  | "requested"
  | "awaiting_payment"
  | "paid"
  | "applied_to_deposit"
  | "refunded"
  | "forfeited"
  | "expired"
  | "cancelled";

export type PaymentMethod =
  | "bank_transfer"
  | "card"
  | "cash"
  | "cheque"
  | "standing_order"
  | "direct_debit";

export interface HoldingDeposit {
  id: string;
  tenant_id: string;
  property_id: string;
  amount: number;
  weekly_rent: number;
  status: HoldingDepositStatus;
  deadline_date: string;
  payment_reference?: string;
  payment_method?: PaymentMethod;
  paid_at?: string;
  refund_amount?: number;
  refund_reason?: string;
  refunded_at?: string;
  forfeit_reason?: string;
  forfeited_at?: string;
  agreement_pdf_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Contract Types
export type TemplateStatus = "draft" | "active" | "archived";

export type AgreementStatus =
  | "draft"
  | "generated"
  | "sent_for_signing"
  | "partially_signed"
  | "fully_signed"
  | "countersigned"
  | "completed"
  | "cancelled"
  | "expired";

export type SignatureStatus = "pending" | "signed" | "declined" | "expired";

export interface ContractClause {
  id: string;
  name: string;
  content: string;
  is_mandatory: boolean;
  order_index: number;
}

export interface ContractTemplate {
  id: string;
  name: string;
  description?: string;
  template_type: string;
  status: TemplateStatus;
  version: number;
  html_content: string;
  clauses?: ContractClause[];
  variables?: string[];
  created_by_id: string;
  created_at: string;
  updated_at: string;
}

export interface Signatory {
  user_id: string;
  name: string;
  email: string;
  role: string;
  status: SignatureStatus;
  signed_at?: string;
  signature_ip?: string;
}

export interface TenancyAgreement {
  id: string;
  tenancy_id: string;
  template_id: string;
  status: AgreementStatus;
  generated_html?: string;
  generated_pdf_url?: string;
  variable_values?: Record<string, unknown>;
  signatories?: Signatory[];
  external_signing_provider?: string;
  external_signing_id?: string;
  external_signing_url?: string;
  sent_for_signing_at?: string;
  fully_signed_at?: string;
  signed_document_url?: string;
  created_at: string;
  updated_at: string;
}

// Maintenance Types
export type IssueCategory =
  | "plumbing"
  | "electrical"
  | "heating"
  | "appliances"
  | "structural"
  | "windows_doors"
  | "roofing"
  | "damp_mould"
  | "pest_control"
  | "garden_exterior"
  | "security"
  | "fire_safety"
  | "gas"
  | "cleaning"
  | "general"
  | "other";

export type IssuePriority = "critical" | "high" | "medium" | "low";

export type IssueStatus =
  | "reported"
  | "acknowledged"
  | "assessing"
  | "awaiting_approval"
  | "approved"
  | "rejected"
  | "assigned"
  | "scheduled"
  | "in_progress"
  | "on_hold"
  | "parts_ordered"
  | "completed"
  | "verified"
  | "closed"
  | "cancelled";

export type JobStatus =
  | "created"
  | "sent_to_supplier"
  | "accepted"
  | "declined"
  | "scheduled"
  | "en_route"
  | "arrived"
  | "in_progress"
  | "parts_required"
  | "completed"
  | "verified"
  | "invoiced"
  | "paid"
  | "disputed"
  | "cancelled";

export interface MaintenanceIssue {
  id: string;
  reference: string;
  property_id: string;
  tenancy_id?: string;
  reported_by_id: string;
  reported_by_type: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  title: string;
  description: string;
  location_in_property?: string;
  photo_urls?: string[];
  video_urls?: string[];
  is_emergency: boolean;
  access_instructions?: string;
  preferred_contact_times?: string[];
  reported_at: string;
  acknowledged_at?: string;
  acknowledged_by_id?: string;
  sla_deadline: string;
  sla_breached: boolean;
  sla_breached_at?: string;
  requires_landlord_approval: boolean;
  landlord_approved: boolean;
  landlord_approved_at?: string;
  landlord_approved_by_id?: string;
  approval_notes?: string;
  estimated_cost?: number;
  cost_approved_up_to?: number;
  escalation_level: number;
  escalated_at?: string;
  assigned_supplier_id?: string;
  completed_at?: string;
  completion_notes?: string;
  tenant_rating?: number;
  tenant_feedback?: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceJob {
  id: string;
  reference: string;
  issue_id: string;
  supplier_id: string;
  status: JobStatus;
  scheduled_date?: string;
  scheduled_time_slot?: string;
  actual_arrival?: string;
  actual_completion?: string;
  work_description?: string;
  materials_used?: { item: string; quantity: number; cost: number }[];
  before_photos?: string[];
  after_photos?: string[];
  evidence_notes?: string;
  labour_hours?: number;
  labour_rate?: number;
  materials_cost?: number;
  total_cost?: number;
  vat_amount?: number;
  invoice_number?: string;
  invoice_url?: string;
  invoiced_at?: string;
  paid_at?: string;
  supplier_notes?: string;
  property_manager_notes?: string;
  follow_up_required: boolean;
  follow_up_notes?: string;
  created_at: string;
  updated_at: string;
}

// Supplier Types
export type SupplierStatus = "pending" | "active" | "suspended" | "inactive";

export type SupplierType = "individual" | "company";

export interface Supplier {
  id: string;
  user_id?: string;
  company_name: string;
  trading_name?: string;
  supplier_type: SupplierType;
  status: SupplierStatus;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  address?: PropertyAddress;
  primary_trade: string;
  skills: string[];
  service_postcodes: string[];
  service_radius_miles: number;
  coordinates?: { lat: number; lng: number };
  hourly_rate?: number;
  callout_fee?: number;
  emergency_rate_multiplier: number;
  vat_registered: boolean;
  vat_number?: string;
  company_registration_number?: string;
  gas_safe_registered: boolean;
  gas_safe_number?: string;
  gas_safe_expiry?: string;
  niceic_registered: boolean;
  niceic_number?: string;
  niceic_expiry?: string;
  other_certifications?: Record<string, unknown>;
  insurance_provider?: string;
  insurance_policy_number?: string;
  insurance_expiry?: string;
  public_liability_cover?: number;
  has_valid_insurance: boolean;
  verified: boolean;
  verified_at?: string;
  verified_by_id?: string;
  average_rating?: number;
  total_jobs_completed: number;
  total_jobs_declined: number;
  on_time_percentage?: number;
  first_fix_rate?: number;
  accepts_emergency: boolean;
  emergency_available: boolean;
  availability?: Record<string, unknown>;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Cost Tracking Types
export type CostType =
  | "labour"
  | "materials"
  | "callout"
  | "emergency_surcharge"
  | "parts"
  | "contractor_fee"
  | "permit_fee"
  | "other";

export type CostStatus =
  | "draft"
  | "submitted"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "invoiced"
  | "paid"
  | "disputed";

export type PaymentStatus = "pending" | "processing" | "paid" | "failed" | "refunded";

export interface JobCost {
  id: string;
  job_id: string;
  issue_id: string;
  property_id: string;
  supplier_id: string;
  cost_type: CostType;
  description: string;
  quantity: number;
  unit_price: number;
  net_amount: number;
  vat_rate: number;
  vat_amount: number;
  gross_amount: number;
  status: CostStatus;
  submitted_at?: string;
  submitted_by_id?: string;
  approved_at?: string;
  approved_by_id?: string;
  rejection_reason?: string;
  invoice_reference?: string;
  invoice_url?: string;
  payment_status: PaymentStatus;
  paid_at?: string;
  payment_reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Compliance Types
export type ComplianceType =
  | "gas_safety"
  | "electrical_eicr"
  | "epc"
  | "fire_alarm"
  | "smoke_co_detectors"
  | "legionella"
  | "pat_testing"
  | "asbestos"
  | "fire_risk_assessment"
  | "hmo_licence"
  | "selective_licence"
  | "buildings_insurance"
  | "landlord_insurance"
  | "boiler_service"
  | "chimney_sweep"
  | "other";

export type ComplianceStatus = "valid" | "expiring_soon" | "expired" | "pending" | "not_required";

export type ReminderStatus = "pending" | "sent" | "acknowledged" | "escalated" | "cancelled";

export interface ComplianceRecord {
  id: string;
  property_id: string;
  compliance_type: ComplianceType;
  status: ComplianceStatus;
  certificate_number?: string;
  issue_date?: string;
  expiry_date?: string;
  next_due_date?: string;
  provider_name?: string;
  provider_registration?: string;
  document_url?: string;
  document_hash?: string;
  notes?: string;
  evidence_urls?: string[];
  evidence_hash_chain?: string[];
  created_by_id: string;
  last_updated_by_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ComplianceReminder {
  id: string;
  compliance_record_id: string;
  days_before_expiry: number;
  reminder_type: string;
  scheduled_date: string;
  status: ReminderStatus;
  sent_at?: string;
  sent_to?: { user_id: string; email: string; name: string }[];
  delivery_method?: string;
  acknowledged_by_id?: string;
  acknowledged_at?: string;
  acknowledgement_notes?: string;
  escalation_level: number;
  escalated_at?: string;
  escalated_to?: string[];
  created_at: string;
  updated_at: string;
}

// Dashboard Types for Property Management
export interface PropertyManagerDashboard {
  total_properties: number;
  properties_available: number;
  properties_let: number;
  occupancy_rate: number;
  pipeline_summary: Record<TenantPipelineStage, number>;
  open_maintenance_issues: number;
  sla_at_risk: number;
  sla_breached: number;
  compliance_expiring_soon: number;
  compliance_expired: number;
  rent_collected_this_month: number;
  rent_due_this_month: number;
  recent_activity: {
    type: string;
    description: string;
    timestamp: string;
    user_name?: string;
  }[];
}

export interface ComplianceDashboard {
  total_properties: number;
  total_records: number;
  by_status: Record<ComplianceStatus, number>;
  by_type: Record<ComplianceType, { valid: number; expiring: number; expired: number; pending: number }>;
  properties_at_risk: { property_id: string; missing_types: string[] }[];
}

export interface SLAStatistics {
  period_days: number;
  total_completed: number;
  on_time: number;
  breached: number;
  on_time_percentage: number;
  average_response_hours: number;
  average_resolution_hours: number;
  by_priority: Record<IssuePriority, { total: number; on_time: number }>;
}
