import { useState, useEffect, useCallback } from "react";
import { incidentsApi } from "../../../../lib/api/incidents";
import type { IncidentRecord } from "../../../../lib/types";

export function useVendorIncidents(vendorId: number | null) {
  const [data, setData] = useState<IncidentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = useCallback(async () => {
    if (vendorId === null) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const incidents = await incidentsApi.getAssigned(vendorId);
      
      const parsedIncidents = incidents.map(incident => {
        let extraData = {};
        try {
          if (incident.data && typeof incident.data === 'string') {
            extraData = JSON.parse(incident.data);
          }
        } catch (e) {
          console.error("Failed to parse incident data:", e);
        }
        return { ...incident, ...extraData };
      });
      
      setData(parsedIncidents);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assigned incidents');
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  return { data, loading, error, refresh: fetchIncidents };
}
