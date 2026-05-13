import { useState, useEffect } from "react";
import { incidentsApi } from "../../../../lib/api/incidents";
import type { IncidentRecord } from "../../../../lib/types";

export function useIncidents() {
  const [data, setData] = useState<IncidentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        const incidents = await incidentsApi.getAll();
        setData(incidents);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch incidents');
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  return { data, loading, error };
}
