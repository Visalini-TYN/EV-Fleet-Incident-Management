import { useState } from "react";
import { useTheme } from "next-themes";
import { Bell, Moon, Sun } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/features/auth/auth-context";
import { ProfileDetailDialog } from "@/features/driver/components/profile-detail-dialog";

/** Pulls "AB"-style initials from a full name. Falls back to "DR" (Driver). */
function getInitials(fullName: string | undefined | null): string {
  if (!fullName) return "DR";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return "DR";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function DashboardHeader() {
  const { theme, setTheme } = useTheme();
  const { profile } = useAuth();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  const profileData = profile as { fullName?: string } | null;
  const initials = getInitials(profileData?.fullName);
  const displayName = profileData?.fullName ?? "Driver";

  return (
    <>
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-6 shrink-0">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-6" />
        <h2 className="text-xl font-bold text-primary tracking-tight">
          FleetOps Driver
        </h2>

        <div className="ml-auto flex items-center gap-3">
          {/* Theme toggle — fully functional */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/*
            Notification bell — kept visible per design. The backend has a
            notifications endpoint but we're not wiring it yet, so the bell
            opens a small popover saying so. This avoids a dead/silent button.
            TODO(feature): wire to /api/notifications when ready.
          */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label="Notifications"
              >
                <Bell className="size-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72">
              <div className="space-y-2">
                <p className="text-sm font-medium">Notifications</p>
                <p className="text-xs text-muted-foreground">
                  You're all caught up. Live notifications will appear here once
                  enabled.
                </p>
              </div>
            </PopoverContent>
          </Popover>

          {/* Clickable avatar — opens profile detail dialog */}
          <button
            type="button"
            onClick={() => setProfileDialogOpen(true)}
            className="rounded-full ring-2 ring-primary/20 transition hover:ring-primary/50 focus:outline-none focus:ring-primary"
            aria-label="View profile"
          >
            <Avatar className="size-9">
              <AvatarImage src="" alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
      </header>

      <ProfileDetailDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
      />
    </>
  );
}