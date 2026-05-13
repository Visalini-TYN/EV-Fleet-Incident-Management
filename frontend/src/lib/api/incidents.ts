import { request, unwrapPage } from "./client";
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

export function parseIncidentData(raw: string | null | undefined): IncidentDataPayload | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as IncidentDataPayload;
  } catch {
    return null;
  }
}

export const incidentsApi = {

  create: (payload: CreateIncidentRequest): Promise<string> =>
    request<string>("/api/complaints", { method: "POST", body: payload }),

 
  getAll: async (): Promise<IncidentRecord[]> => {
    const raw = await request<unknown>("/api/complaints");
    return unwrapPage<IncidentRecord>(raw);
  },

  /** POST /api/complaints/details — fetch a single complaint. */
  getById: (complaintId: number): Promise<IncidentRecord> =>
    request<IncidentRecord>("/api/complaints/details", {
      method: "POST",
      body: { complaintId },
    }),

  getAiChat: (complaintId: number): Promise<AiChatMessage[]> =>
    request<AiChatMessage[]>("/api/complaints/ai-chat", {
      method: "POST",
      body: { complaintId },
    }),
};

export const aiApi = {

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