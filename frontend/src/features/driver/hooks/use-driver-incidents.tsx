import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { incidentsApi, parseIncidentData } from "@/lib/api/incidents";
import type { IncidentDataPayload, IncidentRecord } from "@/lib/types";

interface DriverIncidentsContextValue {
  incidents: IncidentRecord[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getById: (id: number) => Promise<IncidentRecord | null>;
  /** Convenience: parse the JSON blob on a record. */
  parseData: (record: IncidentRecord) => IncidentDataPayload | null;
}

const DriverIncidentsContext = createContext<DriverIncidentsContextValue | null>(null);

export function DriverIncidentsProvider({ children }: { children: ReactNode }) {
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await incidentsApi.getAll();
      // Newest first.
      list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      setIncidents(list);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load incidents";
      setError(message);
      // eslint-disable-next-line no-console
      console.error("Failed to fetch incidents:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const getById = useCallback(
    async (id: number): Promise<IncidentRecord | null> => {
      // Try cache first.
      const cached = incidents.find((i) => i.id === id);
      if (cached) return cached;
      try {
        return await incidentsApi.getById(id);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch incident details:", e);
        return null;
      }
    },
    [incidents],
  );

  const parseData = useCallback((record: IncidentRecord) => parseIncidentData(record.data), []);

  // Initial load.
  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<DriverIncidentsContextValue>(
    () => ({ incidents, loading, error, refresh, getById, parseData }),
    [incidents, loading, error, refresh, getById, parseData],
  );

  return (
    <DriverIncidentsContext.Provider value={value}>{children}</DriverIncidentsContext.Provider>
  );
}

export function useDriverIncidents(): DriverIncidentsContextValue {
  const ctx = useContext(DriverIncidentsContext);
  if (!ctx) {
    throw new Error("useDriverIncidents must be used within a DriverIncidentsProvider");
  }
  return ctx;
}