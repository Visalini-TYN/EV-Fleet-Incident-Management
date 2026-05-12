import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: {
    value: string;
    isUp: boolean;
  };
  variant?: "default" | "critical" | "warning";
}

function StatCard({ label, value, sub, trend, variant = "default" }: StatCardProps) {
  return (
    <Card className="saas-card overflow-hidden">
      <CardContent className="p-6 h-full flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <p className="label-text">{label}</p>
          {trend && (
            <span className={cn(
              "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
              trend.isUp ? "text-emerald-600 bg-emerald-50" : "text-slate-600 bg-slate-100"
            )}>
              {trend.value}
            </span>
          )}
        </div>
        
        <div className="mt-4 flex items-baseline gap-2">
          <p className="metric-value text-foreground">{value}</p>
          {variant === "critical" && (
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          )}
        </div>

        {sub && (
          <p className="text-[12px] font-medium text-muted-foreground mt-2">
            {sub}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      <StatCard
        label="Total Incidents"
        value="1,284"
        trend={{ value: "+12%", isUp: false }}
      />
      <StatCard
        label="Escalated"
        value="42"
        sub="Action required"
        variant="critical"
      />
      <StatCard
        label="Vendor Perf."
        value="94.2%"
        sub="Average Rating"
      />
      <StatCard
        label="SLA Breaches"
        value="05"
        sub="Critical threshold"
        variant="warning"
      />
      <StatCard
        label="Solved"
        value="1,102"
        sub="86% Success Rate"
      />
      <StatCard
        label="Pending"
        value="135"
        sub="Currently in queue"
      />
    </div>
  );
}