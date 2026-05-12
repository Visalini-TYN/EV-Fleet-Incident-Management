import { AppLayout } from "../../../components/shared/app-layout";
import DashboardHeader from "../../../components/shared/dashboard-header";
import StatsCards from "../components/stats-cards";
import IncidentTable from "../components/incident-table";
import Footer from "../../../components/shared/footer";

export default function ManagerDashboard() {
  return (
    <AppLayout activeHref="/">
      <DashboardHeader title="Command Center" />

      <main className="flex-1 overflow-y-auto bg-muted/[0.03]">
        <div className="max-w-[1400px] mx-auto px-8 py-8 space-y-10">
          
          {/* Page Intro */}
          <div className="space-y-1">
            <h1 className="text-[32px] font-bold text-foreground tracking-tight">Overview</h1>
            <p className="text-muted-foreground text-[14px] font-medium">
              Monitor your fleet metrics and active incident escalations in real-time.
            </p>
          </div>

          {/* Stats Section */}
          <div className="space-y-6">
            <h2 className="text-[14px] font-bold text-muted-foreground uppercase tracking-widest">Global Fleet Metrics</h2>
            <StatsCards />
          </div>

          {/* Table Section */}
          <div className="space-y-6 pb-8">
            <h2 className="text-[14px] font-bold text-muted-foreground uppercase tracking-widest">Active Escalations</h2>
            <IncidentTable />
          </div>
        </div>
      </main>

      <Footer />
    </AppLayout>
  );
}