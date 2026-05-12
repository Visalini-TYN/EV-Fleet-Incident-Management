// =============================================================================
// Manager Dashboard API (manager-facing operations)
// Owned by: Manager Dashboard
// =============================================================================

import { request } from "./client";
import type {
  DashboardStats,
  IncidentSummary,
  AuditLogEntry,
  IncidentRecord,
  ApiResponse,
  ManagerDecision,
  AssignComplaintRequest,
  UpdateStatusRequest,
  ResolveComplaintRequest,
  ManagerDecisionRequest,
} from "../types";

export const managerApi = {
  /**
   * GET /api/manager/dashboard/stats
   * Fetches dashboard statistics and metrics for manager overview
   */
  getDashboardStats: (): Promise<DashboardStats> =>
    request<DashboardStats>("/api/manager/dashboard/stats"),

  /**
   * GET /api/complaints
   * Fetches all complaints (manager sees all, driver sees their own)
   */
  getAllComplaints: (): Promise<IncidentRecord[]> =>
    request<IncidentRecord[]>("/api/complaints"),

  /**
   * POST /api/complaints/details
   * Fetches detailed information about a specific complaint
   */
  getComplaintDetails: (complaintId: number): Promise<IncidentRecord> =>
    request<IncidentRecord>("/api/complaints/details", {
      method: "POST",
      body: { complaintId }
    }),

  /**
   * POST /api/complaints/assigned
   * Fetches complaints assigned to a specific vendor
   */
  getAssignedComplaints: (vendorId: number): Promise<IncidentRecord[]> =>
    request<IncidentRecord[]>("/api/complaints/assigned", {
      method: "POST",
      body: { vendorId }
    }),

  /**
   * PUT /api/complaints/status
   * Updates the status of a complaint
   */
  updateComplaintStatus: (request: UpdateStatusRequest): Promise<ApiResponse> =>
    request<ApiResponse>("/api/complaints/status", {
      method: "PUT",
      body: request
    }),

  /**
   * PUT /api/complaints/assign
   * Manager assigns complaint to a vendor
   */
  assignComplaint: (request: AssignComplaintRequest): Promise<ApiResponse> =>
    request<ApiResponse>("/api/complaints/assign", {
      method: "PUT",
      body: request
    }),

  /**
   * PUT /api/complaints/reject
   * Manager rejects a complaint
   */
  rejectComplaint: (complaintId: number): Promise<ApiResponse> =>
    request<ApiResponse>("/api/complaints/reject", {
      method: "PUT",
      body: { complaintId }
    }),

  /**
   * PUT /api/complaints/decision
   * Manager makes a decision on a complaint
   */
  makeDecision: (request: ManagerDecisionRequest): Promise<ApiResponse> =>
    request<ApiResponse>("/api/complaints/decision", {
      method: "PUT",
      body: request
    }),

  /**
   * PUT /api/complaints/resolve
   * Vendor resolves a complaint with remarks
   */
  resolveComplaint: (request: ResolveComplaintRequest): Promise<ApiResponse> =>
    request<ApiResponse>("/api/complaints/resolve", {
      method: "PUT",
      body: request
    }),

  // Legacy methods for backward compatibility
  /**
   * GET /api/manager/incidents/queue
   * Fetches incidents in the manager's queue for review (alias for getAllComplaints)
   */
  getIncidentQueue: (): Promise<IncidentSummary[]> =>
    request<IncidentSummary[]>("/api/manager/incidents/queue"),

  /**
   * GET /api/manager/audit-logs
   * Fetches audit logs for manager review
   */
  getAuditLogs: (): Promise<AuditLogEntry[]> =>
    request<AuditLogEntry[]>("/api/manager/audit-logs"),

  /**
   * POST /api/manager/incidents/{id}/review
   * Manager reviews and takes action on an incident
   */
  reviewIncident: (incidentId: string, action: string, notes?: string): Promise<void> =>
    request<void>(`/api/manager/incidents/${incidentId}/review`, {
      method: "POST",
      body: { action, notes }
    }),

  /**
   * GET /api/manager/incidents/{id}/details
   * Fetches detailed information about a specific incident
   */
  getIncidentDetails: (incidentId: string): Promise<any> =>
    request<any>(`/api/manager/incidents/${incidentId}/details`),
};