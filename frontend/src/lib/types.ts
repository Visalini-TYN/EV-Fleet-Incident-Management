// =============================================================================
// Shared backend-matching types
// Append-only file. Each teammate adds their own section. Do not edit others'.
// =============================================================================

// -----------------------------------------------------------------------------
// AUTH (owned by Teammate A — placeholder shape, confirm with them)
// -----------------------------------------------------------------------------

export type UserRole = "DRIVER" | "VENDOR_ADMIN" | "ADMIN" | "SUPER_ADMIN" | "USER";

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  // TODO(integration): backend doesn't return vehicleId on /profile/me.
  // Once teammate A confirms where this comes from, update here.
  vehicleId?: string;
}

// -----------------------------------------------------------------------------
// DRIVER / INCIDENTS (owned by You)
// -----------------------------------------------------------------------------

/** Backend status enum for complaints (a.k.a. incidents in our UI). */
export type IncidentStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "ASSIGNED_TO_VENDOR"
  | "ESCALATED_TO_MANAGER"
  | "RESOLVED"
  | "REJECTED";

/** Issue categories accepted by the backend (free-string, but these are standard). */
export type IssueCategory =
  | "STARTING_ISSUE"
  | "BATTERY_ISSUE"
  | "TIRE_ISSUE"
  | "SOFTWARE_GLITCH"
  | "CHARGING_ISSUE"
  | "UNKNOWN";

/** Priority hint we send with the complaint. */
export type IncidentPriority = "LOW" | "MEDIUM" | "HIGH";

/**
 * What's inside the `data` string blob on the complaint record.
 * Backend stores user inputs as a stringified JSON here.
 */
export interface IncidentDataPayload {
  issueCategory: IssueCategory;
  issueDescription: string;
  location: string;           // "lat, lng" format per backend example
  vehicleId: string;
  attachments?: string[];     // S3 URLs from /api/documents/upload
}

/**
 * Full complaint record as returned by GET /api/complaints and
 * POST /api/complaints/details.
 * Note: top-level vehicleId/latitude/longitude may be null — real values
 * live inside the `data` string blob.
 */
export interface IncidentRecord {
  id: number;
  status: IncidentStatus;
  issueCategory: IssueCategory;
  priority: IncidentPriority;
  assignedTeam: string | null;
  data: string;                // stringified IncidentDataPayload
  createdAt: string;           // ISO datetime
  customerId: string;          // driver user id (as string)
  vehicleId: string | null;
  vendorId: string | null;
  technicianId: string | null;
  latitude: number | null;
  longitude: number | null;
  escalationReason: string | null;
  workSummary: string | null;
}

/** Payload sent to POST /api/complaints. */
export interface CreateIncidentRequest {
  complaintData: {
    vehicleId: string;
    issueCategory: IssueCategory;
    description: string;
  };
  latitude: number;
  longitude: number;
}

/** Local-only chat message shape for the AI panel. */
export interface ChatMessage {
  id: string;
  role: "driver" | "ai";
  content: string;
  timestamp: string;
}

/** Payload sent to POST /api/ai/queries. */
export interface AiQueryRequest {
  userId: number;
  vehicleId: string;
  vehicleModel?: string;
  question: string;
  // TODO(integration): backend may also accept attachments/context. Confirm.
}

/** Response from POST /api/ai/queries (synchronous — answer is in the response). */
export interface AiQueryResponse {
  id: number;
  question: string;
  answer: string;
  // TODO(integration): exact field names depend on AIQuery entity. Confirm with backend.
}

/** Payload sent to POST /api/workflow/user-response. */
export interface DriverWorkflowResponse {
  complaintId: number;
  resolved: boolean;
  continueAi: boolean;
}

/** Response from POST /api/documents/upload. */
export interface UploadedDocument {
  id: number;
  documentType: string;
  fileUrl: string;
}

// -----------------------------------------------------------------------------
// MANAGER (owned by Teammate B — add your types below)
// -----------------------------------------------------------------------------

/**
 * Manager dashboard statistics and metrics
 */
export interface DashboardStats {
  totalIncidents: number;
  escalatedIncidents: number;
  vendorPerformance: number;
  slaBreaches: number;
  solvedIncidents: number;
  pendingIncidents: number;
  incidentTrend: number; // percentage change
}

/**
 * Summary of incidents for manager queue
 */
export interface IncidentSummary {
  id: string;
  title: string;
  status: string;
  priority: "low" | "medium" | "high" | "critical";
  createdAt: string;
  driverId: string;
  location: string;
}

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  id: string;
  action: string;
  userId: string;
  userRole: string;
  timestamp: string;
  details: string;
  incidentId?: string;
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
}

/**
 * Manager decision types
 */
export type ManagerDecision = "APPROVE" | "REJECT" | "RETRY" | "ESCALATE";

/**
 * Complaint assignment request
 */
export interface AssignComplaintRequest {
  complaintId: number;
  vendorId: number;
}

/**
 * Complaint status update request
 */
export interface UpdateStatusRequest {
  complaintId: number;
  status: IncidentStatus;
}

/**
 * Complaint resolution request
 */
export interface ResolveComplaintRequest {
  complaintId: number;
  resolved: boolean;
  resolutionRemarks: string;
}

/**
 * Manager decision request
 */
export interface ManagerDecisionRequest {
  complaintId: number;
  managerDecision: ManagerDecision;
}

// -----------------------------------------------------------------------------
// VENDOR (owned by Teammate C — add your types below)
// -----------------------------------------------------------------------------