// =============================================================================
// Incidents API (driver-facing complaints endpoints)
// Owned by: Driver (You)
// =============================================================================

import { request } from "./client";
import type {
  CreateIncidentRequest,
  DriverWorkflowResponse,
  IncidentDataPayload,
  IncidentRecord,
  UploadedDocument,
  AiQueryRequest,
  AiQueryResponse,
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
   * Note: backend returns just a confirmation string, not the created record.
   * Caller should refetch the list after this resolves.
   */
  create: (payload: CreateIncidentRequest): Promise<string> =>
    request<string>("/api/complaints", { method: "POST", body: payload }),

  /**
   * GET /api/complaints
   * Fetches complaints scoped to the logged-in user (driver sees their own).
   */
  getAll: (): Promise<IncidentRecord[]> => request<IncidentRecord[]>("/api/complaints"),

  /**
   * POST /api/complaints/details
   * Fetches a single complaint by ID. Unusual REST style but that's the contract.
   */
  getById: (complaintId: number): Promise<IncidentRecord> =>
    request<IncidentRecord>("/api/complaints/details", {
      method: "POST",
      body: { complaintId },
    }),
};

export const aiApi = {
  /**
   * POST /api/ai/queries
   * Submit an AI question. Synchronous — answer comes back in the response.
   */
  createQuery: (payload: AiQueryRequest): Promise<AiQueryResponse> =>
    request<AiQueryResponse>("/api/ai/queries", { method: "POST", body: payload }),
};

export const workflowApi = {
  /**
   * POST /api/workflow/user-response
   * Driver tells the workflow whether the AI resolved the issue.
   * - resolved=true → workflow closes complaint as RESOLVED
   * - resolved=false, continueAi=true → another AI attempt (up to 3 total)
   * - resolved=false, continueAi=false → escalate to vendor
   */
  submitDriverResponse: (payload: DriverWorkflowResponse): Promise<unknown> =>
    request("/api/workflow/user-response", { method: "POST", body: payload }),
};

export const documentsApi = {
  /**
   * POST /api/documents/upload
   * Multipart upload for incident evidence (photos/videos).
   * Returns the S3 URL via fileUrl — pass that into the AI payload's attachments.
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

