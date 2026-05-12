import { Clock3 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="h-11 bg-white border-t border-border px-8 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-tight">
            System Status: <span className="text-emerald-600">Operational</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock3 size={13} className="text-muted-foreground/60" />
          <span className="text-[11px] font-bold text-muted-foreground/60">Last sync: 2 mins ago</span>
        </div>
      </div>
      <span className="text-[11px] font-bold text-muted-foreground/50 tracking-widest">
        v4.2.1-ENTERPRISE
      </span>
    </footer>
  );
}

