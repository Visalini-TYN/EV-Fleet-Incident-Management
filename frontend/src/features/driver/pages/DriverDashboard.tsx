import { useState } from "react";
import { incidentsApi } from "@/lib/api/incidents";
import { useDriverIncidents } from "../hooks/use-driver-incidents";
import { IncidentForm, type IncidentDraft } from "../components/incident-form";
import { AiChatPanel } from "../components/ai-chat-panel";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/features/auth/auth-context";
// TODO(integration): replace this stub with the real useAuth hook from
// features/auth once teammate A lands it. For now this lets the rest of
// the driver flow be testable independently.

export default function DriverDashboard() {
  const { profile } = useAuth();
// His auth context types `profile` as unknown — narrow it here.
// TODO: refine the type once auth team firms up the profile shape.
  const profileData = profile as
    | { id?: number; vehicleId?: string }
    | null;
  const user = {
    id: profileData?.id ?? 0,
    vehicleId: profileData?.vehicleId ?? "EV-7789", // fallback until backend returns vehicleId
  };
  const { incidents, refresh } = useDriverIncidents();

  const [submitting, setSubmitting] = useState(false);
  const [activeIncidentId, setActiveIncidentId] = useState<number | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<string>("");
  const [activeVehicleId, setActiveVehicleId] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (draft: IncidentDraft) => {
  setSubmitError(null);
  setSubmitting(true);
  try {
    await incidentsApi.create({
      complaintData: {
        vehicleId: draft.vehicleId,
        issueCategory: draft.issueCategory,
        description: draft.description,
      },
      latitude: draft.latitude,
      longitude: draft.longitude,
    });

    // Backend's GET /api/complaints is already scoped to the logged-in user,
    // so the newest entry in the response is the one we just created.
    const fresh = await incidentsApi.getAll();
    const sorted = [...fresh].sort((a, b) =>
      (a.createdAt ?? "") < (b.createdAt ?? "") ? 1 : -1,
    );
    const newest = sorted[0];

    if (newest && typeof newest.id === "number") {
      setActiveIncidentId(newest.id);
      setActiveVehicleId(draft.vehicleId);
      setActiveQuestion(draft.description);
      await refresh();
    } else {
      setSubmitError(
        "Incident created but couldn't open the chat. Check the History page.",
      );
      await refresh();
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to submit incident";
    setSubmitError(msg);
  } finally {
    setSubmitting(false);
  }
};

  const handleConcluded = async () => {
    // Refresh the list so status updates reflect on history page.
    await refresh();
    // Reset active state so the form is ready for another submission.
    setActiveIncidentId(null);
    setActiveQuestion("");
  };

  const openIncidents = incidents.filter(
    (i) => i.status !== "RESOLVED" && i.status !== "REJECTED",
  ).length;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 space-y-6 p-4 sm:p-6">
          <div>
            <h1 className="text-2xl font-semibold">Driver dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {openIncidents > 0
                ? `You have ${openIncidents} open incident${openIncidents === 1 ? "" : "s"}.`
                : "Report an issue and the AI assistant will help right away."}
            </p>
          </div>

          {submitError && (
            <div className="rounded border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {submitError}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <IncidentForm
              defaultVehicleId={user.vehicleId}
              onSubmit={handleSubmit}
              submitting={submitting}
            />
            <AiChatPanel
              complaintId={activeIncidentId}
              userId={user.id}
              vehicleId={activeVehicleId || user.vehicleId}
              initialQuestion={activeQuestion}
              onConcluded={handleConcluded}
            />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}