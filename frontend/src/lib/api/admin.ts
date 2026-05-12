import { api } from "@/lib/api/auth-client";

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export type UserRecord = {
  id: number;
  email: string;
  role?: string;
  userType?: string;
  approvalStatus?: ApprovalStatus | string;
  phoneNumber?: string;
  fullName?: string;
  companyName?: string;
  panNumber?: string;
  gstin?: string;
  gstinDocumentUrl?: string;
};

export type VehicleRecord = {
  id: number;
  vehicleNumber?: string;
  registrationNumber?: string;
  name?: string;
  model?: string;
  status?: string;
  serviceDue?: string;
  assignedDriverName?: string;
  driverName?: string;
  driver?: { fullName?: string } | null;
  assignedDriver?: { fullName?: string } | null;
};

const unwrap = <T,>(payload: { data?: T } | T): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

export async function fetchUsers(status?: ApprovalStatus) {
  const response = await api.get("/api/users", {
    params: status ? { status } : undefined,
  });
  return unwrap<UserRecord[]>(response.data);
}

export async function fetchOrganizations(status?: ApprovalStatus) {
  const response = await api.get("/api/users/organizations", {
    params: status ? { status } : undefined,
  });
  return unwrap<UserRecord[]>(response.data);
}

export async function fetchIndividuals(status?: ApprovalStatus) {
  const response = await api.get("/api/users/individuals", {
    params: status ? { status } : undefined,
  });
  return unwrap<UserRecord[]>(response.data);
}

export async function updateUserStatus(targetId: number, status: ApprovalStatus) {
  const response = await api.post("/api/status/update", { targetId, status });
  return unwrap(response.data);
}

export async function assignVehicle(vehicleId: number, driverId: number) {
  const response = await api.put("/api/users/assign-vehicle", {
    vehicleId,
    driverId,
  });
  return unwrap(response.data);
}

export async function fetchVehicles() {
  const response = await api.get("/api/vehicles");
  return unwrap<VehicleRecord[]>(response.data);
}
