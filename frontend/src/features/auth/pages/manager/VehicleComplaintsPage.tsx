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
import ManagerLayout from "./ManagerLayout"
import { incidentsApi } from "@/lib/api/incidents"
import { vehiclesApi } from "@/lib/api/vehicles"
import type { IncidentRecord } from "@/lib/types"

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

export default function VehicleComplaintsPage() {
  const { vehicleId } = useParams<{ vehicleId: string }>()
  const navigate = useNavigate()
  const [incidents, setIncidents] = useState<IncidentRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [vehicleLabel, setVehicleLabel] = useState<string>("Vehicle")
  const [vehicleModel, setVehicleModel] = useState<string>("")

  useEffect(() => {
    const loadVehicleDetails = async () => {
      if (!vehicleId) {
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

  const totalCount = useMemo(() => incidents.length, [incidents])

  return (
    <ManagerLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
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
            onClick={() => navigate("/manager/vehicle")}
            className="border-slate-200"
          >
            Back to Vehicles
          </Button>
        </div>

        <Card className="min-h-[600px] overflow-hidden border-slate-200 shadow-sm">
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
                      const fields = incident as IncidentRecord & Record<string, unknown>
                      const customerLabel = String(
                        fields.customerId ?? fields.customerld ?? "-",
                      )

                      return (
                        <TableRow
                          key={incident.id}
                          onClick={() => navigate(`/manager/incident/INC-${incident.id}/audit-logs`)}
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
        </Card>

        <div className="text-sm text-slate-500">
          Showing {totalCount} incident{totalCount === 1 ? "" : "s"} on this page.
        </div>
      </div>
    </ManagerLayout>
  )
}
