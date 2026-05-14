import { useState, useEffect } from "react";
import { incidentsApi } from "../../../../lib/api/incidents";
import type { IncidentRecord } from "../../../../lib/types";

export function useIncidents() {
  const [data, setData] = useState<IncidentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const [incidents, techs] = await Promise.all([
        incidentsApi.getAll(),
        incidentsApi.getTechnicians().catch((e) => {
          console.error("Failed to fetch techs in useIncidents", e);
          return [];
        })
      ]);

      console.log("Fetched Techs:", techs);
      const techMap = techs.reduce((acc, tech) => {
        if (tech.id && tech.name) acc[tech.id] = tech.name;
        return acc;
      }, {} as Record<number, string>);
      console.log("Built TechMap:", techMap);
      
      const parsedIncidents = incidents.map(incident => {
        let extraData = {};
        try {
          if (incident.data) {
            extraData = JSON.parse(incident.data);
          }
        } catch (e) {
          console.error("Failed to parse incident data:", e);
        }
        
        const resolvedName = incident.technicianId ? techMap[Number(incident.technicianId)] : undefined;
        return { ...incident, ...extraData, technicianName: resolvedName || incident.technicianName };
      });
      
      setData(parsedIncidents);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch incidents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  return { data, loading, error, refresh: fetchIncidents };
}
