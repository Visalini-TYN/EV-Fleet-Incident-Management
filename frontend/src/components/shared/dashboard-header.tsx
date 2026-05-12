import { Search, Bell, Clock3, CircleHelp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface DashboardHeaderProps {
  title?: string;
}

export default function DashboardHeader({ title = "Incident Management" }: DashboardHeaderProps) {
  return (
    <header className="h-[64px] bg-white/80 backdrop-blur-md border-b border-border/50 px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
      {/* Page Title (Visible on larger screens) */}
      <h2 className="text-[15px] font-semibold text-foreground tracking-tight hidden md:block">
        {title}
      </h2>

      {/* Center Search */}
      <div className="relative w-full max-w-[440px] md:absolute md:left-1/2 md:-translate-x-1/2 px-4 md:px-0">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
        <Input
          placeholder="Search for incidents, vehicles or logs..."
          className="pl-10 h-9 text-[13px] bg-muted/30 border-transparent rounded-lg focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[Bell, Clock3, CircleHelp].map((Icon, i) => (
            <Button key={i} variant="ghost" size="icon" className="text-muted-foreground/60 hover:bg-muted/50 rounded-lg h-8 w-8">
              <Icon size={16} />
            </Button>
          ))}
        </div>
        <div className="w-px h-4 bg-border/60 mx-1 hidden sm:block" />
        <Avatar className="h-8 w-8 ml-1 cursor-pointer transition-opacity hover:opacity-80">
          <AvatarFallback className="bg-gradient-to-tr from-primary to-blue-400 text-white text-[10px] font-bold">
            JD
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
