import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { incidentsApi } from "@/lib/api/incidents";
import { type IncidentRecord } from "@/lib/types";
import VendorLayout from "./VendorLayout";
import { SafeIcon } from "../../../components/SafeIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function VendorIncidentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<IncidentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [resolutionRemarks, setResolutionRemarks] = useState("");
  const [newStatus, setNewStatus] = useState<string>("");

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await incidentsApi.getById(Number(id));
        setIncident(data);
        setNewStatus(data.status);
      } catch (err) {
        setError("Failed to load incident details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!id || !newStatus) return;
    try {
      setUpdating(true);
      await incidentsApi.updateStatus(Number(id), newStatus);
      const data = await incidentsApi.getById(Number(id));
      setIncident(data);
      alert("Status updated successfully.");
    } catch (err) {
      alert("Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleResolve = async () => {
    if (!id || !resolutionRemarks) {
      alert("Please provide resolution remarks.");
      return;
    }
    try {
      setUpdating(true);
      const response = await incidentsApi.resolve(Number(id), resolutionRemarks);
      if (response && response.includes("task not found")) {
         alert("Cannot resolve this incident yet because it is not in the correct workflow state (Vendor task not found).");
      } else {
         alert("Incident resolved successfully.");
      }
      const data = await incidentsApi.getById(Number(id));
      setIncident(data);
    } catch (err) {
      alert("Failed to resolve incident.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </VendorLayout>
    );
  }

  if (error || !incident) {
    return (
      <VendorLayout>
        <div className="mx-auto max-w-4xl py-20 text-center">
          <SafeIcon name="AlertCircle" className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="mt-4 text-2xl font-bold">{error || "Incident not found"}</h2>
          <Button onClick={() => navigate("/vendor/assigned")} className="mt-6">
            Back to Assigned
          </Button>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="rounded-full p-2 hover:bg-slate-100">
              <SafeIcon name="ArrowLeft" className="h-5 w-5 text-slate-600" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">Incident #{incident.id}</h1>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {incident.status}
                </Badge>
              </div>
              <p className="text-sm text-slate-500">Created on {new Date(incident.createdAt).toLocaleString()}</p>
            </div>
          </div>
          
          {incident.status !== 'RESOLVED' && (
            <div className="flex items-center gap-3">
               <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Update Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="IN_REPAIR">In Repair</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleUpdateStatus} disabled={updating || newStatus === incident.status} variant="outline">
                Update
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Details Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Complaint Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400">Category</p>
                    <p className="font-semibold text-slate-900">{incident.issueCategory}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400">Vehicle ID</p>
                    <p className="font-semibold text-slate-900">{incident.vehicleId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400">Priority</p>
                    <p className="font-semibold text-slate-900">{incident.priority || 'MEDIUM'}</p>
                  </div>
                </div>

                <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
                  <p className="text-xs font-bold uppercase text-slate-400 mb-2">Description</p>
                  <p className="text-slate-700 leading-relaxed">
                    {incident.data ? (JSON.parse(incident.data).description || JSON.parse(incident.data).issueDescription || 'No description provided') : 'No description provided'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* AI Diagnosis */}
            {incident.workSummary && incident.workSummary.includes("AI Suggestion") && (
              <Card className="border-blue-100 bg-blue-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800 text-lg">
                    <SafeIcon name="Zap" className="h-5 w-5 fill-blue-600" />
                    AI Diagnosis & Recommended Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const rawRemarks = incident.workSummary.split("AI Suggestion")[1]?.split("Remarks:")[1]?.trim();
                    if (!rawRemarks) return null;
                    
                    // Clean up the string (remove quotes and markdown)
                    const cleanJson = rawRemarks
                      .replace(/^"/, '')
                      .replace(/"$/, '')
                      .replace(/\\"/g, '"')
                      .replace(/\\n/g, '\n')
                      .replace(/```json/g, '')
                      .replace(/```/g, '')
                      .trim();
                    
                    try {
                      const aiData = JSON.parse(cleanJson);
                      return (
                        <div className="space-y-4">
                          {aiData.identified_issue && (
                            <div>
                              <p className="text-xs font-bold text-blue-800 uppercase mb-1">Identified Issue</p>
                              <p className="text-sm text-slate-700">{aiData.identified_issue}</p>
                            </div>
                          )}
                          {aiData.recommended_steps && (
                            <div>
                              <p className="text-xs font-bold text-blue-800 uppercase mb-1">Recommended Steps</p>
                              <ul className="list-disc list-inside space-y-1">
                                {aiData.recommended_steps.map((step: string, i: number) => (
                                  <li key={i} className="text-sm text-slate-700">{step}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    } catch (e) {
                      return <div className="whitespace-pre-wrap text-sm text-slate-700">{cleanJson}</div>;
                    }
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Resolution Form */}
            {incident.status !== 'RESOLVED' && (
              <Card className="border-green-100 bg-green-50/20">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800">Resolve Complaint</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea 
                    placeholder="Enter final resolution remarks..." 
                    value={resolutionRemarks}
                    onChange={(e) => setResolutionRemarks(e.target.value)}
                    className="bg-white"
                  />
                  <Button 
                    onClick={handleResolve} 
                    disabled={updating || !resolutionRemarks}
                    className="bg-green-600 hover:bg-green-700 text-white w-full md:w-auto"
                  >
                    Confirm Resolution
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar Column: Tracking Process */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Process Tracker</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative space-y-8 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-slate-200">
                  {/* Extract timeline from workSummary */}
                  {incident.workSummary ? incident.workSummary.split("\n\n").map((entry, idx, arr) => {
                    const lines = entry.split("\n");
                    const timeAndTitle = lines[0];
                    const actor = lines[1];
                    const isLast = idx === arr.length - 1;
                    
                    return (
                      <div key={idx} className="relative pl-8">
                        <div className={`absolute left-0 top-1.5 h-6 w-6 rounded-full border-2 flex items-center justify-center z-10 ${
                          isLast ? 'border-blue-600 bg-white' : 'border-blue-600 bg-blue-50'
                        }`}>
                          {isLast ? (
                            <div className="h-2 w-2 rounded-full bg-blue-600" />
                          ) : (
                            <div className="h-2 w-2 rounded-full bg-blue-600 opacity-50" />
                          )}
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${isLast ? 'text-blue-600' : 'text-slate-400'}`}>{timeAndTitle}</p>
                          <p className={`text-sm font-bold ${isLast ? 'text-slate-900' : 'text-slate-600'}`}>{actor}</p>
                          {lines[2] && <p className="mt-1 text-xs text-slate-500 italic">{lines[2]}</p>}
                        </div>
                      </div>
                    );
                  }) : (
                    <p className="text-slate-400 text-sm">No history available.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <SafeIcon name="Clock" className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-900 uppercase">SLA Warning</p>
                <p className="text-xs text-amber-800 leading-relaxed mt-1">
                  This incident must be resolved within 2 hours to meet the vendor agreement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </VendorLayout>
  );
}
