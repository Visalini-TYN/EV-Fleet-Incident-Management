// src/pages/OverviewDashboard.tsx
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Star,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import ManagerLayout from "./ManagerLayout"

const metrics = [
  {
    title: "Total Incidents",
    value: "1,284",
    description: "Across all regions",
    badge: "+12%",
    valueColor: "text-slate-900",
  },
  {
    title: "Escalated",
    value: "42",
    description: "Action required immediately",
    icon: AlertTriangle,
    valueColor: "text-red-600",
    iconColor: "text-red-500",
  },
  {
    title: "Vendor Perf.",
    value: "94.2%",
    description: "Average Response Rating",
    icon: Star,
    valueColor: "text-slate-900",
    iconColor: "text-orange-600",
  },
  {
    title: "SLA Breaches",
    value: "05",
    description: "Critical threshold exceeded",
    icon: AlertTriangle,
    valueColor: "text-slate-900",
    iconColor: "text-red-700",
  },
  {
    title: "Solved",
    value: "1,102",
    description: "86% Success Rate",
    icon: CheckCircle2,
    valueColor: "text-slate-900",
    iconColor: "text-blue-700",
  },
  {
    title: "Pending",
    value: "135",
    description: "Currently in processing queue",
    icon: ClipboardList,
    valueColor: "text-slate-900",
    iconColor: "text-slate-600",
  },
]

export default function OverviewDashboard() {
  return (
    <ManagerLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <section className="mb-10">
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-slate-900">
            Overview
          </h1>

          <p className="text-lg text-slate-500">
            Monitor your fleet metrics and active incident escalations in
            real-time.
          </p>
        </section>

        {/* Metrics */}
        <section>
          <h2 className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            Global Fleet Metrics
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {metrics.map((metric, index) => {
              const Icon = metric.icon

              return (
                <Card
                  key={index}
                  className="border-slate-200 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-8">
                    <CardTitle className="text-sm font-bold uppercase text-slate-500">
                      {metric.title}
                    </CardTitle>

                    {metric.badge ? (
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-600">
                        {metric.badge}
                      </span>
                    ) : Icon ? (
                      <Icon
                        className={`h-5 w-5 ${metric.iconColor}`}
                      />
                    ) : null}
                  </CardHeader>

                  <CardContent>
                    <div
                      className={`text-5xl font-bold ${metric.valueColor}`}
                    >
                      {metric.value}
                    </div>

                    <p className="mt-2 text-sm text-slate-400">
                      {metric.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 text-xs font-medium text-slate-400 md:flex-row">
          <div className="flex flex-wrap items-center gap-6">
            <span>© 2024 FleetCore Systems</span>

            <a
              href="#"
              className="transition-colors hover:text-slate-600"
            >
              System Status
            </a>

            <a
              href="#"
              className="transition-colors hover:text-slate-600"
            >
              API Documentation
            </a>
          </div>

          <div className="flex items-center gap-2 uppercase tracking-[0.2em]">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Global Ops Online</span>
          </div>
        </footer>
      </div>
    </ManagerLayout>
  )
}