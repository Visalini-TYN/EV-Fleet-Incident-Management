import { useEffect, useMemo, useState } from "react"
import { Filter } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import ManagerLayout from "./ManagerLayout"
import { managerApi } from "@/lib/api/manager"

type AuditLogRecord = {
  id: number
  complaintId: number
  vehicleId: string | null
  action: string
  performedBy: string
  previousStatus: string | null
  newStatus: string | null
  remarks: string | null
  metadata: string | null
  createdAt: string
}

function formatTimestamp(value: unknown): string {
  if (!value) return "-"
  if (typeof value !== "string") return String(value)
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
}

function getField(record: Record<string, unknown>, keys: string[], fallback = "-") {
  for (const key of keys) {
    const value = record[key]
    if (value !== undefined && value !== null && value !== "") {
      return String(value)
    }
  }
  return fallback
}

function parseMetadata(value: string | null | undefined): Record<string, unknown> | null {
  if (!value) return null
  try {
    return JSON.parse(value) as Record<string, unknown>
  } catch {
    return null
  }
}

function formatStatus(value: string | null | undefined): string {
  if (!value) return "-"
  return value.replace(/_/g, " ")
}

function getActionBadgeClass(action: string) {
  switch (action) {
    case "CREATED":
      return "bg-blue-600 text-white hover:bg-blue-600"
    case "AI_ANALYZED":
      return "bg-violet-600 text-white hover:bg-violet-600"
    case "WORKFLOW_STARTED":
      return "bg-emerald-600 text-white hover:bg-emerald-600"
    default:
      return "bg-slate-200 text-slate-700 hover:bg-slate-200"
  }
}

export default function AuditLogsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const complaintId = id ? parseInt(id.replace("INC-", ""), 10) : NaN

  const [logs, setLogs] = useState<AuditLogRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedLogIndex, setSelectedLogIndex] = useState(0)

  useEffect(() => {
    const loadAuditLogs = async () => {
      if (Number.isNaN(complaintId)) {
        setLogs([])
        return
      }

      try {
        setLoading(true)
        setError(null)
        const response = await managerApi.getAuditLogs(complaintId)
        console.log("Audit log response:", response)

        let normalized: AuditLogRecord[] = []
        if (Array.isArray(response)) {
          normalized = response as AuditLogRecord[]
        } else if (response && typeof response === "object") {
          const record = response as Record<string, unknown>
          if (Array.isArray(record.content)) {
            normalized = record.content as AuditLogRecord[]
          } else if (Array.isArray(record.data)) {
            normalized = record.data as AuditLogRecord[]
          } else {
            normalized = [record as AuditLogRecord]
          }
        }

        setLogs(normalized)
        setSelectedLogIndex(0)
      } catch (err) {
        console.error("Failed to fetch audit logs:", err)
        setError("Failed to load audit logs for this complaint.")
        setLogs([])
      } finally {
        setLoading(false)
      }
    }

    loadAuditLogs()
  }, [complaintId])

  const selectedLog = logs[selectedLogIndex] ?? null
  const totalCount = useMemo(() => logs.length, [logs])

  return (
    <ManagerLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Audit Logs
            </h1>
            <p className="mt-2 text-lg text-slate-500">
              {id ? `Complaint ${id}` : "Complaint audit trail"}
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate(`/manager/incident/${id}`)}
            className="border-slate-200 bg-white"
          >
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Card className="min-h-[600px] overflow-hidden border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-100/70 px-6 py-4">
                <CardTitle className="text-2xl font-semibold">
                  Audit Logs
                </CardTitle>

                <Button variant="ghost" className="gap-2 text-blue-700">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </CardHeader>

              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-12 text-slate-500">
                    Loading audit logs...
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center py-12 text-red-600">
                    {error}
                  </div>
                ) : logs.length === 0 ? (
                  <div className="flex items-center justify-center py-12 text-slate-500">
                    No audit logs found for this complaint.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-100 hover:bg-slate-100">
                          <TableHead>Log ID</TableHead>
                          <TableHead>Complaint ID</TableHead>
                          <TableHead>Vehicle ID</TableHead>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>User/System</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Previous Status</TableHead>
                          <TableHead>New Status</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {logs.map((log, index) => {
                          const isActive = index === selectedLogIndex
                          const metadata = parseMetadata(log.metadata)
                          const logId = `LOG-${log.id}`
                          const action = log.action || "Update"
                          const performedBy = log.performedBy || "System"
                          const details = log.remarks || getField(log as unknown as Record<string, unknown>, ["details", "message", "description", "note"], JSON.stringify(log))

                          return (
                            <TableRow
                              key={`${log.id}-${index}`}
                              onClick={() => setSelectedLogIndex(index)}
                              className={`transition-colors hover:bg-blue-50 ${
                                isActive ? "cursor-pointer bg-blue-50/50" : "cursor-pointer"
                              }`}
                            >
                              <TableCell className="font-semibold">
                                {logId}
                              </TableCell>

                              <TableCell>{log.complaintId}</TableCell>

                              <TableCell>
                                {log.vehicleId || String(metadata?.vehicleId ?? "-")}
                              </TableCell>

                              <TableCell>{formatTimestamp(log.createdAt)}</TableCell>

                              <TableCell className="font-medium">
                                {performedBy}
                              </TableCell>

                              <TableCell>
                                <Badge
                                  className={
                                    isActive
                                      ? getActionBadgeClass(action)
                                      : getActionBadgeClass(action)
                                  }
                                >
                                  {action}
                                </Badge>
                              </TableCell>

                              <TableCell>{formatStatus(log.previousStatus)}</TableCell>

                              <TableCell>{formatStatus(log.newStatus)}</TableCell>

                              <TableCell className="max-w-[320px] truncate">
                                {details}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-5">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="space-y-6 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Log Details
                    </p>

                    <h2 className="mt-1 text-3xl font-bold">
                      {selectedLog
                        ? `LOG-${selectedLog.id}`
                        : "Selected Log"}
                    </h2>
                  </div>

                  <Badge className="rounded-md bg-blue-600 px-3 py-1 text-white hover:bg-blue-600">
                    {selectedLog
                      ? selectedLog.action
                      : "Status"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Timestamp
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {selectedLog ? formatTimestamp(selectedLog.createdAt) : "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      User/System
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {selectedLog ? selectedLog.performedBy : "-"}
                    </p>
                  </div>
                </div>

                {selectedLog && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Previous Status
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {formatStatus(selectedLog.previousStatus)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        New Status
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {formatStatus(selectedLog.newStatus)}
                      </p>
                    </div>
                  </div>
                )}

                {selectedLog?.remarks && (
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Remarks
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {selectedLog.remarks}
                    </p>
                  </div>
                )}

                <div className="rounded-lg border border-slate-200 bg-slate-100 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Technical Details
                  </p>

                  <pre className="overflow-x-auto rounded-md bg-white p-4 text-xs text-slate-800">
{selectedLog ? JSON.stringify({
  ...selectedLog,
  metadata: parseMetadata(selectedLog.metadata),
}, null, 2) : "{}"}
                  </pre>
                </div>

                <div className="space-y-2 text-xs text-slate-500">
                  <p>
                    <span className="font-semibold text-slate-700">
                      Complaint ID:
                    </span>{" "}
                    {id ?? "-"}
                  </p>

                  <p className="truncate">
                    <span className="font-semibold text-slate-700">
                      Total Logs:
                    </span>{" "}
                    {totalCount}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ManagerLayout>
  )
}
