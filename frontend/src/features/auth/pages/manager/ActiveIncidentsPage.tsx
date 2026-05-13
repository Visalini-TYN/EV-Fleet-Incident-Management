"use client"

import {
  AlertTriangle,
  Download,
  Filter,
  ChevronRight,
} from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import ManagerLayout from "./ManagerLayout"
const metrics = [
  {
    title: "Total Incidents",
    value: "1,284",
    subtitle: "+12%",
    footer: "",
    badge: true,
  },
  {
    title: "Escalated",
    value: "42",
    footer: "Action required",
    dot: "bg-rose-500",
  },
  {
    title: "Vendor Perf.",
    value: "94.2%",
    footer: "Average Rating",
  },
  {
    title: "SLA Breaches",
    value: "05",
    footer: "Critical threshold",
  },
  {
    title: "Solved",
    value: "1,102",
    footer: "86% Success Rate",
  },
  {
    title: "Pending",
    value: "135",
    footer: "Currently in queue",
  },
]

const incidents = [
  {
    id: "INC-9921",
    priority: "Critical",
    vendor: "VoltService",
    time: "4h 12m",
    status: "Escalated",
  },
  {
    id: "INC-9854",
    priority: "High",
    vendor: "RapidCharge AI",
    time: "2h 45m",
    status: "Review",
  },
  {
    id: "INC-9712",
    priority: "Critical",
    vendor: "GridWorks",
    time: "6h 08m",
    status: "Escalated",
  },
]

const getPriorityStyle = (priority: string) => {
  switch (priority) {
    case "Critical":
      return "bg-rose-50 text-rose-600 border border-rose-100"
    case "High":
      return "bg-orange-50 text-orange-600 border border-orange-100"
    default:
      return "bg-slate-100 text-slate-600"
  }
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case "Escalated":
      return "bg-rose-50 text-rose-600 border border-rose-100"
    case "Review":
      return "bg-slate-100 text-slate-600 border border-slate-200"
    default:
      return "bg-slate-100 text-slate-600"
  }
}

export default function ActiveIncidentsPage() {
  return (
    <ManagerLayout>
      <div className="mx-auto max-w-[1440px] space-y-10">
        {/* Header */}
        <header>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Active Incidents
          </h1>

          <p className="mt-2 text-lg text-slate-500">
            Manage and resolve active service interruptions across the fleet.
          </p>
        </header>

        {/* Metrics */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {metrics.map((metric) => (
            <Card
              key={metric.title}
              className="min-h-[200px] rounded-xl border border-slate-200 shadow-sm"
            >
              <CardContent className="flex h-full flex-col justify-between p-6">
                <div>
                  <div className="mb-4 flex items-start justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {metric.title}
                    </span>

                    {metric.badge && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        {metric.subtitle}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <h2 className="text-4xl font-bold text-slate-900">
                      {metric.value}
                    </h2>

                    {metric.dot && (
                      <span
                        className={`h-2 w-2 rounded-full ${metric.dot}`}
                      />
                    )}
                  </div>
                </div>

                {metric.footer && (
                  <p className="text-xs font-medium text-slate-500">
                    {metric.footer}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Incident Table */}
        <section>
          <Card className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-6 md:flex-row md:items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Escalated Incident Queue
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Real-time feed of incidents requiring immediate intervention.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="rounded-lg border-slate-200 bg-white"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>

                <Button
                  variant="outline"
                  className="rounded-lg border-slate-200 bg-white"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/60">
                  <TableRow className="border-slate-100 hover:bg-transparent">
                    <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Incident ID
                    </TableHead>

                    <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Priority
                    </TableHead>

                    <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Assigned Vendor
                    </TableHead>

                    <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Time Elapsed
                    </TableHead>

                    <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Status
                    </TableHead>

                    <TableHead className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {incidents.map((incident) => (
                    <TableRow
                      key={incident.id}
                      className="border-slate-100 hover:bg-slate-50/50"
                    >
                      <TableCell className="px-6 py-5 font-bold text-slate-900">
                        <Link
                          to={`/manager/incident/${incident.id}`}
                          className="transition hover:text-[#0070c0] hover:underline"
                        >
                          {incident.id}
                        </Link>
                      </TableCell>

                      <TableCell className="px-6 py-5">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${getPriorityStyle(
                            incident.priority
                          )}`}
                        >
                          {incident.priority}
                        </span>
                      </TableCell>

                      <TableCell className="px-6 py-5 text-slate-600">
                        {incident.vendor}
                      </TableCell>

                      <TableCell className="px-6 py-5 text-slate-600">
                        {incident.time}
                      </TableCell>

                      <TableCell className="px-6 py-5">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${getStatusStyle(
                            incident.status
                          )}`}
                        >
                          {incident.status}
                        </span>
                      </TableCell>

                      <TableCell className="px-6 py-5 text-right">
                        <Link
                          to={`/manager/incident/${incident.id}`}
                          className="inline-flex items-center gap-1 font-bold text-[#0070c0] transition hover:underline"
                        >
                          View
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </section>

        {/* Alert Card */}
        <Card className="border-rose-100 bg-rose-50 shadow-sm">
          <CardContent className="flex items-start gap-4 p-6">
            <div className="rounded-full bg-white p-3 shadow-sm">
              <AlertTriangle className="h-6 w-6 text-rose-600" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-rose-700">
                Critical Incidents Require Immediate Attention
              </h3>

              <p className="mt-1 text-sm text-rose-600">
                42 escalated incidents are currently active across the fleet
                ecosystem. Ensure SLA compliance and rapid vendor response.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ManagerLayout>
  )
}