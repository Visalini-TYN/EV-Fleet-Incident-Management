"use client"

import { useEffect, useState } from "react"
import {
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from "lucide-react"
import { Link } from "react-router-dom"
import { incidentsApi } from "@/lib/api/incidents"
import type { IncidentRecord, PageResponse } from "@/lib/types"

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

const getTimeElapsed = (createdAt: string) => {
  const start = new Date(createdAt).getTime()
  const now = new Date().getTime()
  const diffMs = now - start
  if (isNaN(diffMs) || diffMs < 0) return "0m"
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  return diffHrs > 0 ? `${diffHrs}h ${diffMins}m` : `${diffMins}m`
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case "ESCALATED_TO_MANAGER":
    case "OPEN":
      return "bg-rose-50 text-rose-600 border border-rose-100"
    case "IN_PROGRESS":
    case "ASSIGNED_TO_VENDOR":
      return "bg-blue-50 text-blue-600 border border-blue-100"
    case "RESOLVED":
      return "bg-green-50 text-green-600 border border-green-100"
    default:
      return "bg-slate-100 text-slate-600 border border-slate-200"
  }
}

export default function ActiveIncidentsPage() {
  const [pageData, setPageData] = useState<PageResponse<IncidentRecord> | null>(null)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchIncidents = async () => {
      setLoading(true)
      try {
        const data = await incidentsApi.getPaginated(page, 10)
        setPageData(data)
      } catch (error) {
        console.error("Failed to fetch incidents:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchIncidents()
  }, [page])

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
                      Issue Category
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
                      </TableCell>
                    </TableRow>
                  ) : !pageData || pageData.content.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                        No active incidents found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pageData.content.map((incident) => (
                      <TableRow
                        key={incident.id}
                        className="border-slate-100 hover:bg-slate-50/50"
                      >
                        <TableCell className="px-6 py-5 font-bold text-slate-900">
                          <Link
                            to={`/manager/incident/INC-${incident.id}`}
                            className="transition hover:text-[#0070c0] hover:underline"
                          >
                            INC-{incident.id}
                          </Link>
                        </TableCell>

                        <TableCell className="px-6 py-5">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200`}
                          >
                            {incident.issueCategory}
                          </span>
                        </TableCell>

                        <TableCell className="px-6 py-5 text-slate-600">
                          {incident.assignedTeam || "Unassigned"}
                        </TableCell>

                        <TableCell className="px-6 py-5 text-slate-600">
                          {incident.createdAt ? getTimeElapsed(incident.createdAt) : "N/A"}
                        </TableCell>

                        <TableCell className="px-6 py-5">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${getStatusStyle(
                              incident.status
                            )}`}
                          >
                            {incident.status?.replace(/_/g, " ") || "UNKNOWN"}
                          </span>
                        </TableCell>

                        <TableCell className="px-6 py-5 text-right">
                          <Link
                            to={`/manager/incident/INC-${incident.id}`}
                            className="inline-flex items-center gap-1 font-bold text-[#0070c0] transition hover:underline"
                          >
                            View
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {pageData && pageData.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 p-4">
                <span className="text-sm text-slate-500">
                  Showing page {pageData.number + 1} of {pageData.totalPages} ({pageData.totalElements} total incidents)
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={pageData.first || loading}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={pageData.last || loading}
                    className="flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
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
