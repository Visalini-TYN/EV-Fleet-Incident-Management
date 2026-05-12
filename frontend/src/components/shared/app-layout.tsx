import { Link } from "react-router-dom";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
  activeHref?: string;
  className?: string;
}

const navItems = [
  { href: "/manager", label: "Dashboard" },
  { href: "/incident-queue", label: "Incident Queue" },
  { href: "/audit-log", label: "Audit Log" },
];

export function AppLayout({ children, activeHref, className }: AppLayoutProps) {
  return (
    <div className={cn("min-h-screen flex bg-background text-foreground", className)}>
      <aside className="hidden lg:block w-72 border-r border-border/60 bg-white/95 px-6 py-8 shadow-sm">
        <div className="mb-8">
          <div className="text-3xl font-bold text-primary mb-1">
            FleetCore
          </div>
          <div className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
            Operations Center
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === activeHref;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "block rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  isActive
                    ? "bg-blue-50 text-blue-600 border border-blue-200"
                    : "text-slate-700 hover:bg-slate-50",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 min-h-screen">
        {children}
      </div>
    </div>
  );
}
