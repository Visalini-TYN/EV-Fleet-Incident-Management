import { useState } from "react";
import { incidentsApi } from "@/lib/api/incidents";
import { useDriverIncidents } from "../hooks/use-driver-incidents";
import { IncidentForm, type IncidentDraft } from "../components/incident-form";
import { AiChatPanel } from "../components/ai-chat-panel";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function IncidentReportPage() {
  const { refresh } = useDriverIncidents();

  const [submitting, setSubmitting] = useState(false);
  const [activeIncidentId, setActiveIncidentId] = useState<number | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (draft: IncidentDraft) => {
    setSubmitError(null);
    setSubmitting(true);
    try {
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
    /*
      Constrain the whole sidebar layout to viewport height so its children
      can use flex/overflow to scroll internally without the page itself
      scrolling.
    */
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-screen overflow-hidden">
        <DashboardHeader />
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 sm:p-6">
          {submitError && (
            <div className="mb-4 shrink-0 rounded border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {submitError}
            </div>
          )}

          <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-2">
            {/* Left column scrolls independently */}
            <div className="min-h-0 overflow-y-auto">
              <IncidentForm onSubmit={handleSubmit} submitting={submitting} />
            </div>
            {/* Chat panel manages its own internal scrolling */}
            <div className="min-h-0">
              <AiChatPanel
                complaintId={activeIncidentId}
                initialQuestion={activeQuestion}
                onConcluded={handleConcluded}
              />
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}