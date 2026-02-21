// Chat types for report submission flow

export interface FieldDefinition {
  name: string;
  label: string;
  fieldType: "text" | "datetime" | "date" | "enum" | "number";
  options?: string[];
  value: string | number | null;
  isValid: boolean;
}

export interface DraftState {
  reportType: string;
  reportTypeLabel: string;
  stage: "collecting" | "confirming";
  fields: FieldDefinition[];
  filledCount: number;
  totalRequired: number;
  progressPercent: number;
  nextField?: string;
  isComplete: boolean;
}

export interface QuickAction {
  actionType: "field_option" | "confirm" | "cancel";
  label: string;
  value: string;
  fieldName?: string;
}

export interface SubmissionResult {
  referenceNumber: string;
  reportType: string;
  submittedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  draftState?: DraftState;
  quickActions?: QuickAction[];
  submissionResult?: SubmissionResult;
  showDraftCard?: boolean;
}

export interface ChatResponse {
  id: string;
  content: string;
  role: string;
  createdAt?: string;
  conversationId?: string;
  processingTime?: number;
  modelUsed?: string;
  draftState?: DraftState;
  quickActions?: QuickAction[];
  submissionResult?: SubmissionResult;
  showDraftCard?: boolean;
}
