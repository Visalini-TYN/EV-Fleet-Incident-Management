import { request } from "./client";

export const managerApi = {
  rejectComplaint: (complaintId: number) =>
    request("/api/complaints/reject", {
      method: "PUT",
      body: { complaintId },
    }),

  submitDecision: (complaintId: number, managerDecision: string) =>
    request("/api/complaints/decision", {
      method: "PUT",
      body: { complaintId, managerDecision },
    }),

  reassignComplaint: (complaintId: number, vendorId: number) =>
    request("/api/complaints/reassign", {
      method: "PUT",
      body: { complaintId, vendorId },
    }),

  getAvailableVendors: () =>
    request<any[]>("/api/vendors/available", {
      method: "GET",
    }),

  getVendorStats: (vendorId: number) =>
    request<any>("/api/organizationStats", {
      method: "POST",
      body: { vendorId },
    }),

  getAuditLogs: (complaintId: number) =>
    request<any[]>("/api/audit-logs/complaint", {
      method: "POST",
      body: { complaintId },
    }),
};
