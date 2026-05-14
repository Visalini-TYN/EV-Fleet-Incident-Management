import { type ReactNode } from "react";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function ManagerLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider className="min-h-screen bg-background text-foreground">
      <AppSidebar />
      <SidebarInset className="bg-background">
        <DashboardHeader title="FleetOps Manager" />
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-8">
          {children}
        </main>
        <footer className="w-full border-t border-[var(--app-border)] bg-[var(--app-surface)]">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-4 text-center md:flex-row md:text-left">
            <div className="flex flex-col items-center gap-2 md:flex-row">
              <span className="text-sm font-semibold">VoltFleet</span>
              <p className="text-xs text-muted-foreground">
                (c) 2024 VoltFleet Enterprise Solutions. All rights reserved.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <a className="text-xs text-muted-foreground transition-colors hover:text-primary" href="#">
                Privacy Policy
              </a>
              <a className="text-xs text-muted-foreground transition-colors hover:text-primary" href="#">
                Terms of Service
              </a>
              <a className="text-xs text-muted-foreground transition-colors hover:text-primary" href="#">
                Security Audit
              </a>
            </div>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
