import { request, unwrapPage } from "./client";
import type { ServiceHistoryRecord } from "../types";

export const serviceHistoryApi = {
  /** GET /api/service-history/vehicle/{vehicleId} — admin-only service history for a vehicle. */
  getByVehicleId: async (vehicleId: number): Promise<ServiceHistoryRecord[]> => {
    const raw = await request<unknown>(`/api/service-history/vehicle/${vehicleId}`);
    return unwrapPage<ServiceHistoryRecord>(raw);
  },
};