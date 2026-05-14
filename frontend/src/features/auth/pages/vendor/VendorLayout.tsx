import { type ReactNode } from "react";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function VendorLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider className="min-h-screen bg-[#f8f9ff] text-[#181c21]">
      <AppSidebar />
      <SidebarInset className="bg-[#f8f9ff]">
        <DashboardHeader />
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-8">
          {children}
        </main>
        <footer className="w-full border-t border-[#c0c7d3]/20 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-4 text-center md:flex-row md:text-left">
            <div className="flex flex-col items-center gap-2 md:flex-row">
              <span className="text-sm font-semibold">FleetOps</span>
              <p className="text-xs text-[#717783]">
                © 2024 FleetOps Enterprise Solutions. All rights reserved.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <a className="text-xs text-[#717783] transition-colors hover:text-[#005797]" href="#">
                Privacy Policy
              </a>
              <a className="text-xs text-[#717783] transition-colors hover:text-[#005797]" href="#">
                Terms of Service
              </a>
              <a className="text-xs text-[#717783] transition-colors hover:text-[#005797]" href="#">
                Support
              </a>
            </div>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
