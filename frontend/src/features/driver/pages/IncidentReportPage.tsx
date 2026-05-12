import { useState } from "react";
import { incidentsApi } from "@/lib/api/incidents";
import { useDriverIncidents } from "../hooks/use-driver-incidents";
import { IncidentForm, type IncidentDraft } from "../components/incident-form";
import { AiChatPanel } from "../components/ai-chat-panel";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/features/auth/auth-context";

export default function IncidentReportPage() {
  const { profile } = useAuth();
  const { refresh } = useDriverIncidents();

  // Auth profile is typed as unknown — narrow here.
  const profileData = profile as { id?: number } | null;
  const user = {
    id: profileData?.id ?? 0,
    // vehicleId is now resolved server-side, but the AI chat still needs
    // a value to send with /api/ai/queries. Use a placeholder until backend
    // also auto-fills it there.
    vehicleId: "AUTO",
  };

  const [submitting, setSubmitting] = useState(false);
  const [activeIncidentId, setActiveIncidentId] = useState<number | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (draft: IncidentDraft) => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      // vehicleId is omitted — backend resolves it from the driver's
      // assigned vehicle automatically.
      await incidentsApi.create({
        complaintData: {
          issueCategory: draft.issueCategory,
          description: draft.description,
        },
        latitude: draft.latitude,
        longitude: draft.longitude,
      });

      const fresh = await incidentsApi.getAll();
      if (!Array.isArray(fresh) || fresh.length === 0) {
        setSubmitError(
          "Incident created, but the list came back empty. Check the History page.",
        );
        await refresh();
        return;
      }

      const sorted = [...fresh].sort((a, b) =>
        (a.createdAt ?? "") < (b.createdAt ?? "") ? 1 : -1,
      );
      const newest = sorted[0];

      if (newest && typeof newest.id === "number") {
        setActiveIncidentId(newest.id);
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
    await refresh();
    setActiveIncidentId(null);
    setActiveQuestion("");
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 space-y-6 p-4 sm:p-6">
          {submitError && (
            <div className="rounded border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {submitError}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <IncidentForm onSubmit={handleSubmit} submitting={submitting} />
            <AiChatPanel
              complaintId={activeIncidentId}
              userId={user.id}
              vehicleId={user.vehicleId}
              initialQuestion={activeQuestion}
              onConcluded={handleConcluded}
            />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}