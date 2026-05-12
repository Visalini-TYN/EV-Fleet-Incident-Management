import * as React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  AlertCircle,
  ClipboardList,
  Settings,
  FilePlus,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type NavItem = {
  icon: React.ElementType;
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Command Center", href: "/" },
  { icon: AlertCircle, label: "Incident Queue", href: "/incident-queue" },
  { icon: ClipboardList, label: "Audit Log", href: "/audit-log" },
  { icon: FilePlus, label: "Service Logs", href: "#service-logs" },
  { icon: Settings, label: "System Admin", href: "#admin" },
];

function AppSidebar({ activeHref }: { activeHref?: string }) {
  const navigate = useNavigate();
  return (
    <Sidebar collapsible="none" className="w-[240px] border-r border-border/60 bg-white">
      {/* Brand */}
      <SidebarHeader className="px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm shadow-primary/20">
            <LayoutDashboard size={18} />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground leading-none">
              FleetCore
            </h1>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">
              Operations Center
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => {
                const isActive = activeHref === item.href;
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      isActive={isActive}
                      className={cn(
                        "rounded-md px-3 h-9 transition-all duration-200",
                        isActive
                          ? "bg-primary/5 text-primary font-semibold"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                      onClick={() => navigate(item.href)}
                    >
                      <item.icon size={16} className={isActive ? "text-primary" : "text-muted-foreground"} />
                      <span className="text-[13px]">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto">
        <div className="space-y-4">
          {/* User Profile */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/40">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">
              AM
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">Alex Mercer</p>
              <p className="text-[10px] text-muted-foreground truncate">Fleet Manager</p>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors">
              <LogOut size={12} />
            </Button>
          </div>

          <Button
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold text-[13px] h-9 rounded-md gap-2 shadow-sm"
            onClick={() => {}}
          >
            <FilePlus size={14} />
            New Incident
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

interface AppLayoutProps {
  children: React.ReactNode;
  activeHref?: string;
}

export function AppLayout({ children, activeHref }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar activeHref={activeHref} />
      <SidebarInset className="bg-background min-h-screen">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
