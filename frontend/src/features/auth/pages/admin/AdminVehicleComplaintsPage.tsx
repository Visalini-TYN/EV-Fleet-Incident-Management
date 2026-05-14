import { useEffect, useMemo, useState } from "react"
import { Filter } from "lucide-react"
import { useParams, useNavigate } from "react-router-dom"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import AdminLayout from "./AdminLayout"
import { useAuth } from "@/features/auth/auth-context"
import { incidentsApi, parseIncidentData } from "@/lib/api/incidents"
import { serviceHistoryApi } from "@/lib/api/service-history"
import { vehiclesApi } from "@/lib/api/vehicles"
import type { IncidentRecord, ServiceHistoryRecord } from "@/lib/types"

function getStatusBadgeClass(status: string) {
  return status === "OPEN"
    ? "bg-yellow-200 text-yellow-900 hover:bg-yellow-200"
    : "bg-slate-200 text-slate-700 hover:bg-slate-200"
}

function formatDate(isoDate: string) {
  const date = new Date(isoDate)
  return Number.isNaN(date.getTime())
    ? isoDate
    : date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
}

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) return "—"
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value)
}

export default function AdminVehicleComplaintsPage() {
  const { vehicleId } = useParams<{ vehicleId: string }>()
  const navigate = useNavigate()
  const { role } = useAuth()
  const [incidents, setIncidents] = useState<IncidentRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [vehicleLabel, setVehicleLabel] = useState<string>("Vehicle")
  const [vehicleModel, setVehicleModel] = useState<string>("")
  const [serviceHistory, setServiceHistory] = useState<ServiceHistoryRecord[]>([])
  const [serviceHistoryLoading, setServiceHistoryLoading] = useState(false)
  const [serviceHistoryError, setServiceHistoryError] = useState<string | null>(null)

  const normalizedRole = role?.toLowerCase() ?? ""
  const showServiceHistory = normalizedRole === "admin"

  useEffect(() => {
    const loadVehicleDetails = async () => {
      if (!vehicleId) {
        setServiceHistory([])
        setServiceHistoryError(null)
        return
      }

      const numericVehicleId = Number(vehicleId)
      if (!Number.isFinite(numericVehicleId)) {
        setVehicleLabel(`Vehicle ${vehicleId}`)
        setVehicleModel("")
        return
      }

      try {
        const vehicle = await vehiclesApi.getById(numericVehicleId)
        const displayLabel = [vehicle.make, vehicle.model].filter(Boolean).join(" ")
        setVehicleLabel(displayLabel || `Vehicle ${vehicleId}`)
        setVehicleModel(vehicle.model || "")
      } catch (err) {
        console.error("Failed to fetch vehicle details:", err)
        setVehicleLabel(`Vehicle ${vehicleId}`)
        setVehicleModel("")
      }
    }

    const loadIncidents = async () => {
      if (!vehicleId) {
        setIncidents([])
        return
      }

      try {
        setLoading(true)
        setError(null)
        const response = await incidentsApi.getByVehicleId(vehicleId, 0, 10)
        setIncidents(response.content ?? [])
      } catch (err) {
        console.error("Failed to fetch vehicle incidents:", err)
        setError("Failed to load incidents for this vehicle.")
        setIncidents([])
      } finally {
        setLoading(false)
      }
    }

    loadVehicleDetails()
    loadIncidents()
  }, [vehicleId])

  useEffect(() => {
    const loadServiceHistory = async () => {
      if (!showServiceHistory || !vehicleId) {
        setServiceHistory([])
        setServiceHistoryError(null)
        return
      }

      const numericVehicleId = Number(vehicleId)
      if (!Number.isFinite(numericVehicleId)) {
        setServiceHistory([])
        setServiceHistoryError("Invalid vehicle ID.")
        return
      }

      try {
        setServiceHistoryLoading(true)
        setServiceHistoryError(null)
        const entries = await serviceHistoryApi.getByVehicleId(numericVehicleId)
        setServiceHistory(entries)
      } catch (err) {
        console.error("Failed to fetch service history:", err)
        setServiceHistory([])
        setServiceHistoryError("Failed to load service history for this vehicle.")
      } finally {
        setServiceHistoryLoading(false)
      }
    }

    void loadServiceHistory()
  }, [showServiceHistory, vehicleId])

  const totalCount = useMemo(() => incidents.length, [incidents])

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#f8f9ff] text-slate-900 flex flex-col">
        <main className="mx-auto w-full max-w-7xl flex-1 px-8 py-10">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">
                Vehicle Incidents
              </h1>
              <p className="mt-2 text-slate-500">
                {vehicleId
                  ? `Viewing complaints for ${vehicleLabel}${vehicleModel ? ` (${vehicleModel})` : ""}`
                  : "Select a vehicle to view complaints."}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/vehicle")}
              className="border-slate-200"
            >
              Back to Vehicles
            </Button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-100 px-6 py-4">
              <CardTitle className="text-2xl font-semibold">
                Incidents for {vehicleLabel}{vehicleModel ? ` (${vehicleModel})` : ""}
              </CardTitle>

              <Button
                variant="ghost"
                className="gap-2 text-blue-600 hover:text-blue-700"
              >
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-slate-500">Loading incidents...</p>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-red-600">{error}</p>
                </div>
              ) : incidents.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-slate-500">No incidents found for this vehicle.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-100 hover:bg-slate-100">
                        <TableHead className="px-6 py-4 font-semibold">ID</TableHead>
                        <TableHead className="px-6 py-4 font-semibold">Status</TableHead>
                        <TableHead className="px-6 py-4 font-semibold">Category</TableHead>
                        <TableHead className="px-6 py-4 font-semibold">Customer</TableHead>
                        <TableHead className="px-6 py-4 font-semibold">Vehicle</TableHead>
                        <TableHead className="px-6 py-4 text-right font-semibold">Created</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {incidents.map((incident) => {
                        const incidentData = parseIncidentData(incident.data)
                        const fields = incident as IncidentRecord & Record<string, unknown>
                        const customerLabel = String(
                          fields.customerId ?? fields.customerld ?? "-",
                        )

                        return (
                          <TableRow
                            key={incident.id}
                            onClick={() => navigate(`/admin/incident/INC-${incident.id}/audit-logs`)}
                            className="cursor-pointer border-b transition-colors hover:bg-blue-50"
                          >
                            <TableCell className="px-6 py-4 font-semibold">
                              #{incident.id}
                            </TableCell>

                            <TableCell className="px-6 py-4">
                              <Badge className={getStatusBadgeClass(incident.status)}>
                                {incident.status}
                              </Badge>
                            </TableCell>

                            <TableCell className="px-6 py-4 font-medium">
                              {incident.issueCategory}
                            </TableCell>

                            <TableCell className="px-6 py-4 text-sm text-slate-600">
                              {customerLabel}
                            </TableCell>

                            <TableCell className="px-6 py-4 text-sm text-slate-600">
                              {vehicleLabel}
                            </TableCell>

                            <TableCell className="px-6 py-4 text-right text-sm text-slate-600">
                              {formatDate(incident.createdAt)}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </div>

          {showServiceHistory && (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <CardHeader className="border-b bg-slate-100 px-6 py-4">
                <CardTitle className="text-2xl font-semibold">
                  Service history
                </CardTitle>
                <p className="mt-1 text-sm text-slate-500">
                  Admin-only maintenance snapshot for this vehicle.
                </p>
              </CardHeader>

              <CardContent className="px-0 py-0">
                {serviceHistoryLoading ? (
                  <div className="px-6 py-8 text-sm text-slate-500">
                    Loading service history...
                  </div>
                ) : serviceHistoryError ? (
                  <div className="px-6 py-8 text-sm text-red-600">
                    {serviceHistoryError}
                  </div>
                ) : serviceHistory.length === 0 ? (
                  <div className="px-6 py-8 text-sm text-slate-500">
                    No service history found for this vehicle.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-100 hover:bg-slate-100">
                          <TableHead className="px-6 py-4 font-semibold">ID</TableHead>
                          <TableHead className="px-6 py-4 font-semibold">Service date</TableHead>
                          <TableHead className="px-6 py-4 font-semibold">Service type</TableHead>
                          <TableHead className="px-6 py-4 font-semibold">Odometer</TableHead>
                          <TableHead className="px-6 py-4 font-semibold">Cost</TableHead>
                          <TableHead className="px-6 py-4 font-semibold">Description</TableHead>
                          <TableHead className="px-6 py-4 font-semibold">Vehicle</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {serviceHistory.map((entry) => (
                          <TableRow key={entry.id} className="border-b transition-colors hover:bg-blue-50">
                            <TableCell className="px-6 py-4 font-semibold">
                              #{entry.id}
                            </TableCell>
                            <TableCell className="px-6 py-4 text-sm text-slate-600">
                              {formatDate(entry.serviceDate)}
                            </TableCell>
                            <TableCell className="px-6 py-4 text-sm text-slate-600">
                              {entry.serviceType}
                            </TableCell>
                            <TableCell className="px-6 py-4 text-sm text-slate-600">
                              {entry.odometerReading?.toLocaleString("en-IN") ?? "—"}
                            </TableCell>
                            <TableCell className="px-6 py-4 text-sm text-slate-600">
                              {formatCurrency(entry.cost)}
                            </TableCell>
                            <TableCell className="px-6 py-4 text-sm text-slate-600">
                              {entry.description ?? "—"}
                            </TableCell>
                            <TableCell className="px-6 py-4 text-sm text-slate-600">
                              {vehicleLabel}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </div>
          )}

          <div className="mt-4 text-sm text-slate-500">
            Showing {totalCount} incident{totalCount === 1 ? "" : "s"} on this page.
          </div>
        </main>

        <footer className="border-t bg-white px-8 py-6">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-800">
                VoltFleet
              </span>

              <span className="text-sm text-slate-500">
                © 2024 VoltFleet Enterprise Solutions.
              </span>
            </div>

            <div className="flex flex-wrap gap-5 text-sm text-slate-500">
              <button className="hover:text-[#005797]">
                Privacy Policy
              </button>

              <button className="hover:text-[#005797]">
                Terms of Service
              </button>

              <button className="hover:text-[#005797]">
                Security Audit
              </button>
            </div>
          </div>
        </footer>
      </div>
    </AdminLayout>
  )
}
