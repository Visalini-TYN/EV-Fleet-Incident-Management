import { AppLayout } from "@/components/shared/app-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import StatsCards from "../components/stats-cards";
import IncidentTable from "../components/incident-table";
import Footer from "@/components/shared/footer";

export default function IncidentQueue() {
  return (
    <AppLayout activeHref="/incident-queue">
      <DashboardHeader title="Incident Queue" />

      <main className="flex-1 overflow-y-auto bg-muted/[0.03]">
        <div className="max-w-[1400px] mx-auto px-8 py-8 space-y-10">
          
          <div className="space-y-1">
            <h1 className="text-[32px] font-bold text-foreground tracking-tight">Active Incidents</h1>
            <p className="text-muted-foreground text-[14px] font-medium">
              Manage and resolve active service interruptions across the fleet.
            </p>
          </div>

          <div className="space-y-6">
            <StatsCards />
          </div>

          <div className="space-y-6 pb-8">
            <IncidentTable />
          </div>
        </div>
      </main>

      <Footer />
    </AppLayout>
  );
}