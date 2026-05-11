import { Link, useLocation } from "react-router-dom";
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
  AlertTriangle,
  History,
  Settings,
  Siren,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/" },
  { title: "Complaints", icon: AlertTriangle, url: "/" },
  { title: "History", icon: History, url: "/history" },
  { title: "Settings", icon: Settings, url: "/settings" },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-5 group-data-[collapsible=icon]:px-2">
        <div className="flex flex-col items-start gap-3">
          <Avatar className="size-16 rounded-xl border-2 border-primary group-data-[collapsible=icon]:size-8">
            <AvatarImage src="" alt="Driver" />
            <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold text-lg">
              DR
            </AvatarFallback>
          </Avatar>
          <div className="group-data-[collapsible=icon]:hidden">
            <div className="text-lg font-bold text-primary leading-tight">
              Driver ID: 8842
            </div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
              Regional Transport
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
                      className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-semibold data-[active=true]:border data-[active=true]:border-primary/30"
                    >
                      <Link to={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-3">
        <Button
          variant="destructive"
          className="w-full justify-center gap-2 font-semibold"
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