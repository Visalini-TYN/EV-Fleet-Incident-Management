import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { incidentsApi, parseIncidentData } from "@/lib/api/incidents";
import { IncidentDetailsCard } from "../components/incident-details-card";
import { AiChatPanel } from "../components/ai-chat-panel";
import type { IncidentRecord } from "@/lib/types";

/** Sanity-check the response shape before trusting it.
 *  We accept anything that's an object with an `id` field — be it number or
 *  string. Backend has been inconsistent about this. */
function isValidIncident(x: unknown): x is IncidentRecord {
  if (typeof x !== "object" || x === null) return false;
  const obj = x as Record<string, unknown>;
  return obj.id !== undefined && obj.id !== null;
}

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [incident, setIncident] = useState<IncidentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const numericId = id ? parseInt(id, 10) : NaN;

  // Effect depends ONLY on the URL id. No cache, no churn from external state.
  useEffect(() => {
    if (!Number.isFinite(numericId)) {
      setError("Invalid incident ID.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setIncident(null);

    incidentsApi
      .getById(numericId)
      .then((fresh) => {
        if (cancelled) return;
        console.log("[Detail] fetch resolved with:", fresh);
        if (!isValidIncident(fresh)) {
          console.error("[Detail] response not valid:", fresh);
          setError("Incident response was malformed.");
          setIncident(null);
        } else {
          setIncident(fresh as IncidentRecord);
        }
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : "Failed to load incident";
        setError(msg);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [numericId]);

  const payload = incident ? parseIncidentData(incident.data) : null;
  const initialQuestion =
    payload?.description ?? payload?.issueDescription ?? "";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-screen overflow-hidden">
        <DashboardHeader />
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 sm:p-6">
          <div className="mb-4 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/driver/history")}
              className="-ml-2"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to history
            </Button>
          </div>

          {loading && (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading incident…
            </div>
          )}

          {!loading && error && (
            <div className="rounded border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {!loading && !error && incident && (
            <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-2">
              <div className="min-h-0">
                <IncidentDetailsCard incident={incident} />
              </div>
              <div className="min-h-0">
                <AiChatPanel
                  complaintId={incident.id}
                  initialQuestion={initialQuestion}
                  readOnly
                />
              </div>
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}