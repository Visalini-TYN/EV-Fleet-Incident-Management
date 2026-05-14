import { Link, useLocation, useNavigate } from "react-router-dom";
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
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileWarning,
  History,
  LogOut,
  Siren,
} from "lucide-react";
import { useAuth } from "@/features/auth/auth-context";

const driverNavItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/driver" },
  { title: "Incident Report", icon: FileWarning, url: "/driver/report" },
  { title: "History", icon: History, url: "/driver/history" },
];

const adminNavItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/home" },
  { title: "Onboarding", icon: FileWarning, url: "/admin/onboarding" },
  { title: "Vehicle", icon: History, url: "/admin/vehicle" },
];

const managerNavItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/manager" },
  { title: "Vehicle", icon: History, url: "/manager/vehicle" },
];

/** Pulls "AB" style initials from a full name. Falls back to "DR". */
function getInitials(fullName: string | undefined | null): string {
  if (!fullName) return "DR";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return "DR";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const vendorAdminNavItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/vendor" },
  { title: "Assigned Incidents", icon: FileWarning, url: "/vendor/assigned" },
  { title: "Resolution Queue", icon: History, url: "/vendor/resolution" },
  { title: "Reports", icon: LayoutDashboard, url: "/vendor/reports" },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, role: authRole } = useAuth();

  // Loose narrowing — profile is typed as `unknown` in the auth context.
  const profileData = profile as
    | { id?: number; fullName?: string; role?: string; email?: string }
    | null;
  const displayName = profileData?.fullName ?? "Driver";
  const userId = profileData?.id;
  const role = authRole ?? profileData?.role ?? "Driver";
  const initials = getInitials(profileData?.fullName);
  const normalizedRole = role.toLowerCase();
  
  const isVendorAdmin = normalizedRole === "vendor_admin" || normalizedRole === "vendor-admin";
  const isAdmin = normalizedRole === "admin";
  const isManager = normalizedRole === "manager";
  
  const navItems = isVendorAdmin ? vendorAdminNavItems : isAdmin ? adminNavItems : isManager ? managerNavItems : driverNavItems;

  const displayRoleLabel = (() => {
    if (normalizedRole === "vendor_admin" || normalizedRole === "vendor-admin") return "Vendor Admin";
    if (normalizedRole === "admin") return "Admin";
    if (normalizedRole === "manager") return "Manager";
    if (normalizedRole === "driver") return "Driver";
    return role;
  })();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    // Hard reload so AuthProvider re-evaluates from scratch.
    window.location.href = "/login";
    window.location.reload();
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-5 group-data-[collapsible=icon]:px-2">
        <div className="flex flex-col items-start gap-3">
          <Avatar className="size-16 rounded-xl border-2 border-[var(--app-brand)] group-data-[collapsible=icon]:size-8">
            <AvatarImage src="" alt={displayName} />
            <AvatarFallback className="rounded-xl bg-[var(--app-brand-soft)] text-[var(--app-brand)] font-bold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="group-data-[collapsible=icon]:hidden">
            <div className="text-base font-bold leading-tight text-[var(--app-brand)]">
              {displayName}
            </div>
            <div className="mt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
              {userId !== undefined ? `${displayRoleLabel} · ID ${userId}` : displayRoleLabel}
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className="data-[active=true]:border data-[active=true]:border-[var(--app-brand)] data-[active=true]:bg-[var(--app-brand-soft)] data-[active=true]:font-semibold data-[active=true]:text-[var(--app-brand)]"
                    >
                      <Link to={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* Logout — styled like nav but performs an action, not a link */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Logout"
                  onClick={handleLogout}
                  className="cursor-pointer"
                >
                  <LogOut className="size-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-3">
        <Button
          variant="destructive"
          className="w-full justify-center gap-2 font-semibold"
          onClick={() => {
            // TODO(feature): hook up a real emergency contact / dispatch flow.
            // For now this just acknowledges the click so the button isn't dead.
            window.alert(
              "Emergency dispatch is not yet wired up. Call your dispatch line directly.",
            );
            // Reference navigate so the import isn't unused if we add routing here later.
            void navigate;
          }}
        >
          <Siren className="size-4" />
          <span className="group-data-[collapsible=icon]:hidden">
            Emergency Help
          </span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
