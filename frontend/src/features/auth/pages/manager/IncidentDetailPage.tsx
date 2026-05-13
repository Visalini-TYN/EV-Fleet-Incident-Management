"use client";

import { useEffect, useState } from "react";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Car,
  User,
  Monitor,
  Zap,
  ArrowRightLeft,
  Loader2,
  XCircle,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import ManagerLayout from "./ManagerLayout";
import { incidentsApi } from "@/lib/api/incidents";
import { vehiclesApi } from "@/lib/api/vehicles";
import { managerApi } from "@/lib/api/manager";
import { api } from "@/lib/api/auth-client";
import type { IncidentRecord, AiChatMessage, IncidentDataPayload, Vehicle } from "@/lib/types";

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const complaintId = id ? parseInt(id.replace("INC-", ""), 10) : NaN;

  const [incident, setIncident] = useState<IncidentRecord | null>(null);
  const [payload, setPayload] = useState<IncidentDataPayload | null>(null);
  const [aiMessages, setAiMessages] = useState<AiChatMessage[]>([]);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [driver, setDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Manager Actions State
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [isRetryOpen, setIsRetryOpen] = useState(false);
  
  // Reassign Modal State
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [vendorStats, setVendorStats] = useState<any>(null);

  const showToastAndNavigate = (text: string) => {
    setToastMessage({ type: "success", text });
  };

  const openAuditLogs = () => {
    navigate(`/manager/incident/${id}/audit-logs`);
  };

  const handleReject = async () => {
    try {
      setActionLoading(true);
      await managerApi.rejectComplaint(complaintId);
      setIsRejectOpen(false);
      showToastAndNavigate("Complaint rejected successfully.");
    } catch (e) {
      console.error(e);
      setToastMessage({ type: "error", text: "Failed to reject complaint." });
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async () => {
    try {
      setActionLoading(true);
      await managerApi.submitDecision(complaintId, "RESOLVE");
      setIsResolveOpen(false);
      showToastAndNavigate("Complaint resolved successfully.");
    } catch (e) {
      console.error(e);
      setToastMessage({ type: "error", text: "Failed to resolve complaint." });
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetry = async () => {
    try {
      setActionLoading(true);
      await managerApi.submitDecision(complaintId, "RETRY");
      setIsRetryOpen(false);
      showToastAndNavigate("Complaint retried to next vendor.");
    } catch (e) {
      console.error(e);
      setToastMessage({ type: "error", text: "Failed to retry complaint." });
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const openReassign = async () => {
    setIsReassignOpen(true);
    try {
      const res = await managerApi.getAvailableVendors();
      // Handle page response if it comes back nested
      let v = res as any;
      if (v && v.data) v = v.data;
      if (v && v.content) v = v.content;
      setVendors(Array.isArray(v) ? v : []);
    } catch (e) {
      console.error(e);
    }
  };

  const selectVendorForReassign = async (v: any) => {
    setSelectedVendor(v);
    setVendorStats(null);
    try {
      const stats = await managerApi.getVendorStats(v.vendorId || v.id);
      setVendorStats(stats || {});
    } catch (e) {
      console.error(e);
    }
  };

  const handleReassign = async () => {
    if (!selectedVendor) return;
    try {
      setActionLoading(true);
      const vId = selectedVendor.vendorId || selectedVendor.id;
      if (!vId) throw new Error("Missing vendor ID");
      await managerApi.reassignComplaint(complaintId, Number(vId));
      setIsReassignOpen(false);
      showToastAndNavigate("Complaint reassigned successfully.");
    } catch (e) {
      console.error(e);
      setToastMessage({ type: "error", text: "Failed to reassign complaint." });
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (isNaN(complaintId)) return;

    const fetchData = async () => {
      try {
        const [incRes, chatRes] = await Promise.all([
          incidentsApi.getById(complaintId),
          incidentsApi.getAiChat(complaintId).catch(() => [] as AiChatMessage[])
        ]);
        setIncident(incRes);
        let parsedPayload = null;
        try {
          if (incRes.data) {
            parsedPayload = JSON.parse(incRes.data);
            setPayload(parsedPayload);
          }
        } catch (e) {}
        setAiMessages(chatRes);

        // Fetch driver
        if (incRes.customerId) {
          try {
            const individualsRes = await api.get("/api/users/individuals", { params: { size: 1000 } });
            let usersList = individualsRes.data;
            if (usersList && usersList.data) usersList = usersList.data;
            if (usersList && usersList.content) usersList = usersList.content;
            if (Array.isArray(usersList)) {
              const matchedDriver = usersList.find((u: any) => String(u.id) === String(incRes.customerId));
              if (matchedDriver) setDriver(matchedDriver);
            }
          } catch (e) {
            console.error("Failed to fetch driver details", e);
          }
        }

        // Fetch vehicle
        const vIdToFetch = incRes.vehicleId || parsedPayload?.vehicleId;
        if (vIdToFetch) {
          try {
            const vehicleData = await vehiclesApi.getById(Number(vIdToFetch));
            setVehicle(vehicleData);
          } catch (e) {
            console.error("Failed to fetch vehicle details", e);
          }
        }

      } catch (error) {
        console.error("Failed to fetch incident details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [complaintId]);

  if (isNaN(complaintId)) {
    return <Navigate to="/manager/active" replace />;
  }

  if (loading) {
    return (
      <ManagerLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </ManagerLayout>
    );
  }

  if (!incident) {
    return <Navigate to="/manager/active" replace />;
  }

  const vId = incident.vehicleId || payload?.vehicleId || "Unknown Vehicle";
  const desc = payload?.description || payload?.issueDescription || "No description provided.";

  return (
    <ManagerLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <section className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                {id}
              </h1>

              <Badge className="bg-red-100 text-red-600 hover:bg-red-100 uppercase tracking-wider">
                {incident.status?.replace(/_/g, " ")}
              </Badge>
            </div>

            <p className="text-sm text-gray-500">
              Report Date{" "}
              <span className="font-medium">
                {new Date(incident.createdAt).toLocaleString()}
              </span>{" "}
              • Assigned to{" "}
              <span className="font-semibold text-gray-700">
                {incident.assignedTeam || "Unassigned"}
              </span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" className="shadow-sm" onClick={openAuditLogs}>
              Audit Logs
            </Button>

            <Button variant="outline" className="shadow-sm border-red-200 text-red-600 hover:bg-red-50" onClick={() => setIsRejectOpen(true)}>
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>

            <Button variant="outline" className="shadow-sm border-orange-200 text-orange-600 hover:bg-orange-50" onClick={() => setIsRetryOpen(true)}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Auto-Retry
            </Button>

            <Button variant="outline" className="gap-2 shadow-sm" onClick={openReassign}>
              <ArrowRightLeft className="h-4 w-4" />
              Manual Reassign
            </Button>

            <Button className="bg-green-600 hover:bg-green-700 shadow-sm" onClick={() => setIsResolveOpen(true)}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Resolve
            </Button>
          </div>
        </section>

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Side */}
          <div className="space-y-8 lg:col-span-8">
            {/* Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Vehicle Card */}
              <Card className="border-gray-100 shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                    <Car className="h-4 w-4" />
                    Vehicle Information
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {vehicle ? `${vehicle.make} ${vehicle.model}` : vId}
                    </h3>

                    <p className="text-gray-600">
                      {vehicle ? `License Plate: ${vehicle.licensePlate}` : "Fleet Vehicle"}
                    </p>
                    
                    {vehicle?.vin && (
                      <p className="pt-1 font-mono text-xs uppercase text-gray-400">
                        VIN: {vehicle.vin}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Driver Card */}
              <Card className="border-gray-100 shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                    <User className="h-4 w-4" />
                    Driver Information
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {driver?.fullName || `Driver ${incident.customerId}`}
                    </h3>

                    <p className="text-gray-600">
                      ID: {incident.customerId}
                    </p>

                    {driver?.email && (
                      <p className="text-sm text-gray-500 mt-1">
                        {driver.email}
                      </p>
                    )}
                    {driver?.phoneNumber && (
                      <p className="text-sm text-gray-500">
                        Phone: {driver.phoneNumber}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Diagnostics */}
            <Card className="border-gray-100 shadow-sm">
              <CardContent className="p-8">
                <div className="mb-10 flex items-start justify-between">
                  <h2 className="text-lg font-bold text-gray-900">
                    Issue Details
                  </h2>

                  <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-100 uppercase tracking-widest">
                    {incident.issueCategory}
                  </Badge>
                </div>

                <div className="border-l-4 border-blue-500 py-2 pl-6">
                  <p className="text-lg italic leading-relaxed text-gray-700">
                    {desc}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <aside className="lg:col-span-4">
            <Card className="h-full min-h-[600px] border-gray-100 shadow-sm">
              <CardContent className="p-6">
                <div className="mb-8 flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-blue-600" />

                  <h2 className="text-lg font-bold text-gray-900">
                    AI Troubleshooting History
                  </h2>
                </div>

                <div className="relative space-y-8">
                  {/* Timeline line */}
                  <div className="absolute bottom-0 left-3 top-0 w-px bg-gray-200" />

                  {aiMessages.length === 0 ? (
                    <div className="pl-10 text-sm text-gray-500 italic py-4">
                      No AI troubleshooting history found.
                    </div>
                  ) : (
                    aiMessages.map((msg, index) => (
                      <div className="relative flex gap-4" key={index}>
                        <div
                          className={`z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
                            msg.sender === "USER"
                              ? "border-2 border-gray-200 bg-white"
                              : "bg-blue-600"
                          }`}
                        >
                          {msg.sender === "USER" ? (
                            <User className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Zap className="h-4 w-4 text-white" />
                          )}
                        </div>

                        <div className="flex-1 space-y-3">
                          <p
                            className={`text-xs font-bold uppercase tracking-tight ${
                              msg.sender === "USER" ? "text-gray-900" : "text-blue-600"
                            }`}
                          >
                            {msg.sender === "USER" ? `Driver ${incident.customerId}` : "FleetCore AI"}
                          </p>

                          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 shadow-sm">
                            <p className="text-sm italic leading-relaxed text-gray-600">
                              {msg.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Complaint</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">Are you sure you want to reject this complaint?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={actionLoading}>Confirm Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isResolveOpen} onOpenChange={setIsResolveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Complaint</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">Are you sure you want to resolve this complaint?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResolveOpen(false)}>Cancel</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleResolve} disabled={actionLoading}>Confirm Resolve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRetryOpen} onOpenChange={setIsRetryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Auto-Retry (Next Vendor)</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">This will automatically assign the complaint to the next nearest available vendor. Continue?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRetryOpen(false)}>Cancel</Button>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={handleRetry} disabled={actionLoading}>Confirm Retry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isReassignOpen} onOpenChange={setIsReassignOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Manual Reassign Vendor</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-md p-4 max-h-[400px] overflow-y-auto">
              <h4 className="font-bold text-sm mb-2 text-gray-700">Available Vendors</h4>
              {vendors.length === 0 ? <p className="text-xs text-gray-500">No vendors found.</p> : (
                <div className="space-y-2">
                  {vendors.map((v) => (
                    <div 
                      key={v.vendorId || v.id} 
                      className={`p-3 border rounded-md cursor-pointer transition ${selectedVendor?.vendorId === v.vendorId ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
                      onClick={() => selectVendorForReassign(v)}
                    >
                      <p className="font-semibold text-sm">{v.companyName || v.name || "Vendor"}</p>
                      <p className="text-xs text-gray-500">{v.email}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border rounded-md p-4">
              <h4 className="font-bold text-sm mb-2 text-gray-700">Vendor Stats</h4>
              {!selectedVendor ? (
                <p className="text-xs text-gray-500">Select a vendor to view stats.</p>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm"><strong>Name:</strong> {selectedVendor.companyName}</p>
                  <p className="text-sm"><strong>Rating:</strong> {selectedVendor.rating || "N/A"}</p>
                  <p className="text-sm"><strong>Distance:</strong> {selectedVendor.distanceKm ? `${selectedVendor.distanceKm} km` : "N/A"}</p>
                  {vendorStats && (
                    <div className="mt-4 p-3 bg-gray-50 rounded text-xs space-y-1">
                      <p><strong>Total Assigned:</strong> {vendorStats.totalAssigned || 0}</p>
                      <p><strong>Resolved:</strong> {vendorStats.totalResolved || 0}</p>
                      <p><strong>Avg Resolution Time:</strong> {vendorStats.avgResolutionTime ? `${vendorStats.avgResolutionTime} mins` : "N/A"}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReassignOpen(false)}>Cancel</Button>
            <Button disabled={!selectedVendor || actionLoading} onClick={handleReassign}>Confirm Assignment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Toast Notification */}
      {toastMessage && (
        <div 
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg px-6 py-4 shadow-xl transition-all animate-in slide-in-from-bottom-5 ${
            toastMessage.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <XCircle className="h-5 w-5" />
          )}
          <span className="font-medium text-sm">{toastMessage.text}</span>
        </div>
      )}
    </ManagerLayout>
  );
}