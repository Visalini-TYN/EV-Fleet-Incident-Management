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
  make?: string;
  licensePlate?: string;
  status?: string;
  serviceDue?: string;
  assignedDriverName?: string;
  driverName?: string;
  driver?: { fullName?: string } | null;
  assignedDriver?: { fullName?: string } | null;
};

export type PaginatedResponse<T> = {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
};

const unwrap = <T,>(payload: unknown): T => {
  // Handle Spring Boot Page<T> response with "content" property
  if (payload && typeof payload === "object" && "content" in payload) {
    return (payload as { content: T }).content;
  }
  // Handle envelope wrapper with "data" property
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  // Return as-is if it's already the unwrapped data
  return payload as T;
};

const unwrapPaginated = <T,>(payload: unknown): PaginatedResponse<T> => {
  // The API returns { message: "...", data: { content: [...], pageable: {...}, ... } }
  // We need to extract the data object which contains the paginated response
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: PaginatedResponse<T> }).data;
  }
  return payload as PaginatedResponse<T>;
};

export async function fetchUsers(status?: ApprovalStatus, page: number = 0, size: number = 10) {
  const response = await api.get("/api/users", {
    params: {
      ...(status ? { status } : {}),
      page,
      size,
    },
  });
  const paginatedData = unwrapPaginated<UserRecord>(response.data);
  return paginatedData;
}

export async function fetchOrganizations(status?: ApprovalStatus, page: number = 0, size: number = 10) {
  const response = await api.get("/api/users/organizations", {
    params: {
      ...(status ? { status } : {}),
      page,
      size,
    },
  });
  const paginatedData = unwrapPaginated<UserRecord>(response.data);
  return paginatedData;
}

export async function fetchIndividuals(status?: ApprovalStatus, page: number = 0, size: number = 10) {
  const response = await api.get("/api/users/individuals", {
    params: {
      ...(status ? { status } : {}),
      page,
      size,
    },
  });
  const paginatedData = unwrapPaginated<UserRecord>(response.data);
  return paginatedData;
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
  let data = response.data;
  
  // Log the raw response for debugging
  console.log("Raw vehicles response:", data);
  
  // If wrapped in message envelope, unwrap it
  if (data && typeof data === "object" && "data" in data && !("content" in data)) {
    data = data.data;
  }
  
  // Handle Spring Page response with content
  if (data && typeof data === "object" && "content" in data) {
    const result = (data as { content: VehicleRecord[] }).content;
    console.log("Vehicles extracted from content:", result);
    return result;
  }
  
  // Handle direct array response
  if (Array.isArray(data)) {
    console.log("Vehicles already an array:", data);
    return data as VehicleRecord[];
  }
  
  // Fallback
  console.log("Could not parse vehicles response, returning empty array");
  return [] as VehicleRecord[];
}
