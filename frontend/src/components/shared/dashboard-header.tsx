import { useTheme } from "next-themes";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bell, HelpCircle, Moon, Sun } from "lucide-react";

interface DashboardHeaderProps {
  title?: string;
}

export function DashboardHeader({ title }: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-white/95 backdrop-blur-sm px-6 shrink-0">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-6" />
      <h2 className="text-base font-semibold text-slate-900 tracking-tight">
        {title ?? "Dashboard"}
      </h2>

      <div className="ml-auto flex items-center gap-3">
        <Badge
          variant="outline"
          className="gap-2 font-medium border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
        >
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          Status: Active
        </Badge>

        <Separator orientation="vertical" className="h-6 hidden md:block" />

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="size-5" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <HelpCircle className="size-5" />
        </Button>
        <Avatar className="size-9 ring-2 ring-primary/20">
          <AvatarImage src="" alt="Driver" />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            DR
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}