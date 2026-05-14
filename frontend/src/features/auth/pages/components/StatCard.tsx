import { SafeIcon } from "../../../components/SafeIcon";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: string;
  trend?: string;
  trendType?: "up" | "down";
}

export default function StatCard({ title, value, icon, trend, trendType }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
          <SafeIcon name={icon || "BarChart"} className="h-5 w-5" />
        </div>
        {trend && (
          <span className={`text-xs font-semibold ${trendType === "up" ? "text-green-600" : "text-red-600"}`}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
      <h3 className="mt-1 text-3xl font-bold text-slate-900">{value}</h3>
    </div>
  );
}
