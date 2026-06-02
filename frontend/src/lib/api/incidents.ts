// =============================================================================
// Incidents API (driver-facing complaints endpoints)
// Owned by: Driver (You)
// =============================================================================

import { request } from "./client";
import type {
  AiChatMessage,
  AiQueryRequest,
  AiQueryResponse,
  CreateIncidentRequest,
  DriverWorkflowResponse,
  IncidentDataPayload,
  IncidentRecord,
  UploadedDocument,
} from "../types";

/**
 * Parse the stringified `data` blob on an incident record.
 * Backend stores user inputs as a JSON string here — safer than crashing
 * if it's malformed.
 */
export function parseIncidentData(raw: string | null | undefined): IncidentDataPayload | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as IncidentDataPayload;
  } catch {
    return null;
  }
}

export const incidentsApi = {
  /**
   * POST /api/complaints
   * Driver submits a new complaint.
   * Backend returns a confirmation string, not the created record — caller
   * should refetch the list after this resolves.
   */
  create: (payload: CreateIncidentRequest): Promise<string> =>
    request<string>("/api/complaints", { method: "POST", body: payload }),

  /** GET /api/complaints — list complaints scoped to the logged-in user. */
  getAll: (): Promise<IncidentRecord[]> => request<IncidentRecord[]>("/api/complaints"),

  /** POST /api/complaints/details — fetch a single complaint. */
  getById: (complaintId: number): Promise<IncidentRecord> =>
    request<IncidentRecord>("/api/complaints/details", {
      method: "POST",
      body: { complaintId },
    }),

  /**
   * POST /api/complaints/ai-chat
   * Returns the clean conversational chat history (AI + USER messages
   * interleaved in chronological order). This is the recommended way to
   * render the AI chat — no more regex parsing of workSummary.
   */
  getAiChat: (complaintId: number): Promise<AiChatMessage[]> =>
    request<AiChatMessage[]>("/api/complaints/ai-chat", {
      method: "POST",
      body: { complaintId },
    }),
};

export const aiApi = {
  /**
   * POST /api/ai/queries
   * @deprecated Follow-up questions now go through workflowApi.submitDriverResponse
   * with continueAi=true and userFollowUp set. This endpoint is kept around for
   * compatibility but no longer used by the chat panel.
   */
  createQuery: (payload: AiQueryRequest): Promise<AiQueryResponse> =>
    request<AiQueryResponse>("/api/ai/queries", { method: "POST", body: payload }),
};

export const workflowApi = {
  /**
   * POST /api/workflow/user-response
   * Three behaviors based on the body:
   *   { resolved: true,  continueAi: false }                        → mark RESOLVED
   *   { resolved: false, continueAi: false }                        → escalate to vendor
   *   { resolved: false, continueAi: true,  userFollowUp: "..." }   → ask AI a follow-up
   */
  submitDriverResponse: (payload: DriverWorkflowResponse): Promise<unknown> =>
    request("/api/workflow/user-response", { method: "POST", body: payload }),
};

export const documentsApi = {
  /**
   * POST /api/documents/upload
   * Multipart upload for incident evidence (photos/videos).
   * Returns the S3 URL via fileUrl.
   */
  upload: (file: File, documentType: string = "OTHER"): Promise<UploadedDocument> => {
    const form = new FormData();
    form.append("file", file);
    form.append("documentType", documentType);
    return request<UploadedDocument>("/api/documents/upload", {
      method: "POST",
      body: form,
      multipart: true,
    });
  },
};