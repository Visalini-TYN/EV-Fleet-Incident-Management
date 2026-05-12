import { request } from "./client";
import type { Vehicle } from "../types";

export const vehiclesApi = {
  getAll: (): Promise<Vehicle[]> => request<Vehicle[]>("/api/vehicles"),

  getMyVehicle: async (userId: number): Promise<Vehicle | null> => {
    const all = await request<Vehicle[]>("/api/vehicles");
    return all.find((v) => v.userId === userId) ?? null;
  },
};