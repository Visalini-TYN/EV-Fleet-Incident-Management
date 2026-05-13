import { request, unwrapPage } from "./client";
import type { Vehicle } from "../types";

export const vehiclesApi = {
  /** GET /api/vehicles — returns user's vehicles (paginated by backend). */
  getAll: async (): Promise<Vehicle[]> => {
    const raw = await request<unknown>("/api/vehicles");
    return unwrapPage<Vehicle>(raw);
  },

  /** GET /api/vehicles/{id} — Fetch a single vehicle by its internal ID. */
  getById: (id: number): Promise<Vehicle> => request<Vehicle>(`/api/vehicles/${id}`),

  /** Get the vehicle assigned to a specific user. */
  getMyVehicle: async (userId: number): Promise<Vehicle | null> => {
    const raw = await request<unknown>("/api/vehicles");
    const all = unwrapPage<Vehicle>(raw);
    return all.find((v) => v.userId === userId) ?? null;
  },

  /** Create a new vehicle record. `userId` is optional. */
  /**
   * Create a new vehicle record.
   * By default the frontend will NOT send an `id` field (backend should assign ids).
   * If the backend requires client-assigned ids (not recommended), set
   * `opts.clientAssignedId = true` to attach a client-generated id starting at 50.
   */
  create: (
    payload: Partial<Vehicle>,
    opts?: { clientAssignedId?: boolean },
  ): Promise<Vehicle> => {
    const body = { ...(payload as Record<string, unknown>) };

    if (opts?.clientAssignedId) {
      // Assign a client-side incremental id when explicitly requested by caller.
      function getNextClientVehicleId(): number {
        try {
          const key = "nextVehicleId";
          const raw = localStorage.getItem(key);
          let next = raw ? Number(raw) : 50;
          if (!Number.isFinite(next) || Number.isNaN(next) || next < 50) next = 50;
          // increment for next time
          localStorage.setItem(key, String(next + 1));
          return next;
        } catch {
          // localStorage unavailable — fall back to a safe constant
          return 50;
        }
      }

      if (body.id === undefined || body.id === null) {
        (body as any).id = getNextClientVehicleId();
      }
    }

    // Ensure default status is AVAILABLE unless explicitly provided
    if ((body as any).status === undefined || (body as any).status === null) {
      (body as any).status = "AVAILABLE";
    }

    return request<Vehicle>("/api/vehicles", { method: "POST", body });
  },
};