export type UserRole = "DRIVER" | "VENDOR_ADMIN" | "ADMIN" | "SUPER_ADMIN" | "USER";

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

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
  | "BATTERY"
  | "MOTOR"
  | "SOFTWARE"
  | "CHARGING"
  | "BRAKE"
  | "TYRE"
  | "UNKNOWN";

/** Single message from POST /api/complaints/ai-chat. */
export interface AiChatMessage {
  sender: "AI" | "USER";
  message: string;
  confidence: number | null;
  timestamp: string;
  attemptCount: number | null;
}  

/** Vehicle record from GET /api/vehicles. */
export interface Vehicle {
  id: number;
  userId: number | null;
  make: string;
  model: string;
  licensePlate: string;
  vin: string;
  status: "AVAILABLE" | "ACTIVE" | "INACTIVE" | "UNDER_MAINTENANCE" | "DECOMMISSIONED";
  yearOfManufacture: number;
  batteryCapacityKwh: number;
  chassisNo: string;
  assignedDriverName?: string;
  driverName?: string;
  driver?: { fullName?: string } | null;
  assignedDriver?: { fullName?: string } | null;
}  

/** Priority hint we send with the complaint. */
export type IncidentPriority = "LOW" | "MEDIUM" | "HIGH";

/**
 * What's inside the `data` string blob on the complaint record.
 * Backend stores user inputs as a stringified JSON here.
 */
export interface IncidentDataPayload {
  issueCategory: IssueCategory;
  /** Backend stores the driver's description here. Older records used
   *  `issueDescription`; newer records use `description`. We read both. */
  description?: string;
  issueDescription?: string;
  location?: string;
  vehicleId?: string;
  attachments?: string[];
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

/** Payload sent to POST /api/complaints.
 * vehicleId is optional — backend auto-assigns it from the user's assigned vehicle. */
export interface CreateIncidentRequest {
  complaintData: {
    vehicleId?: string;
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
/** Payload sent to POST /api/workflow/user-response.
 * When continueAi is true, include userFollowUp with the driver's next question. */
export interface DriverWorkflowResponse {
  complaintId: number;
  resolved: boolean;
  continueAi: boolean;
  userFollowUp?: string;
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

// -----------------------------------------------------------------------------
// VENDOR (owned by Teammate C — add your types below)
// -----------------------------------------------------------------------------
