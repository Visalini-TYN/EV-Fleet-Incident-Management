import { request, unwrapPage } from "./client";
import type { Vehicle } from "../types";

export const vehiclesApi = {
  /** GET /api/vehicles — returns user's vehicles (paginated by backend). */
  getAll: async (): Promise<Vehicle[]> => {
    const raw = await request<unknown>("/api/vehicles");
    return unwrapPage<Vehicle>(raw);
  },

  /** Get the vehicle assigned to a specific user. */
  getMyVehicle: async (userId: number): Promise<Vehicle | null> => {
    const raw = await request<unknown>("/api/vehicles");
    const all = unwrapPage<Vehicle>(raw);
    return all.find((v) => v.userId === userId) ?? null;
  },
};