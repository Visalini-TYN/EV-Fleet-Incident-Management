import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle, ArrowLeftRight, Bot, Car, ChevronRight,
  CircleAlert, Clock, Download, ImagePlus, User, ZapOff, Search,
  Share2, MoreVertical,
} from "lucide-react";

import { AppLayout } from "@/components/shared/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import Footer from "@/components/shared/footer";
import { cn } from "@/lib/utils";

/* ─── mock data ──────────────────────────────────────────────── */
const incident = {
  id: "INC-9921",
  status: "Escalated",
  vehicle: { id: "EV-7704", model: "Tesla Model 3 Performance", vin: "5YJ3E1EB0LFX000000" },
  driver: { name: "Marcus Thorne", driverId: "DR-9012", rank: "Gold", phone: "+1 (655) 012-3456" },
  report: { date: "Oct 24, 14:22", battery: "88%", stationId: "Supercharger-L42" },
  issueTitle: "Charging System Failure",
  description:
    '"While attempting to initiate a fast-charge sequence at the L42 hub, the vehicle displayed a \'DC Charge Port Locked\' error. Cooling fans engaged at maximum RPM immediately, and charging was terminated by the BMS. Vehicle is currently immobilized on-site."',
  category: "Critical Power",
  bmsState: "Warning [E-401]",
  ambientTemp: "34°C (93°F)",
  systemVoltage: "398V DC",
  evidence: ["Charge_Port_Error.jpg", "Warning_Message.jpg", "Vehicle_Site_Wide.jpg"],
};

const aiMessages = [
  {
    type: "driver" as const,
    sender: "Marcus Thorne",
    text: '"My charger is stuck and the fans are screaming. Screen says \'DC Charge Port Locked\'. Help!"',
    time: "Pre-escalation",
  },
  {
    type: "ai" as const,
    sender: "FleetCore AI",
    text: '"Analyzing telemetry... Thermal runaway detected in charge port sensors. Initiating safe-mode shutdown."',
  },
  {
    type: "feedback" as const,
    sender: "Driver Feedback",
    text: '"Tried the release, cable is still jammed solid. I\'m not waiting around for it to catch fire. Send someone now."',
    time: "Escalated to Vendor Dispatch at 14:28",
  },
];

const automatedSteps = [
  "Perform Emergency Manual Release via trunk cable.",
  "Check charging station for physical lock-pin failure.",
  "Wait 10 mins for thermal stabilization, then retry boot.",
];

const activityLog = [
  { dot: "red",  label: "Incident Escalated",    sub: "Oct 24, 14:28 • Driver Request" },
  { dot: "blue", label: "AI Diagnostic Completed", sub: "Oct 24, 14:23 • Diagnostic System" },
  { dot: "gray", label: "Incident Created",       sub: "Oct 24, 14:22 • Auto-Logged" },
];

/* ─── component ──────────────────────────────────────────────── */
export default function IncidentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <AppLayout activeHref="/incident-queue">
      {/* ── Navbar ───────────────────────────────── */}
      <header className="h-[64px] bg-white border-b border-border/50 px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-8 w-8 text-muted-foreground">
            <ChevronRight className="rotate-180" size={18} />
          </Button>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer" onClick={() => navigate("/")}>Operations</span>
            <ChevronRight size={14} className="text-border" />
            <span className="hover:text-foreground cursor-pointer" onClick={() => navigate("/incident-queue")}>Incidents</span>
            <ChevronRight size={14} className="text-border" />
            <span className="text-foreground font-bold">{id ?? incident.id}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-8 text-xs font-semibold gap-2 border-border/60">
            <Share2 size={14} /> Share
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 border-border/60">
            <MoreVertical size={14} />
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-muted/[0.03]">
        <div className="max-w-[1400px] mx-auto px-8 py-8 space-y-8">
          
          {/* ── Title & Actions ───────────────────── */}
          <div className="flex items-end justify-between border-b border-border/40 pb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h1 className="text-[32px] font-bold text-foreground tracking-tight">
                  {id ?? incident.id}
                </h1>
                <Badge className="bg-red-50 text-red-600 border-red-100 font-bold px-2 py-0.5 h-6 text-[11px] uppercase tracking-wider">
                  Escalated
                </Badge>
              </div>
              <p className="text-muted-foreground text-[14px] font-medium">
                Last updated 4 minutes ago • Assigned to <span className="text-foreground font-bold">VoltService</span>
              </p>
            </div>
            
            <div className="flex gap-3 mb-1">
              <Button variant="outline" className="h-10 px-5 text-[13px] font-bold border-border/80">Reject</Button>
              <Button variant="outline" className="h-10 px-5 text-[13px] font-bold border-border/80 gap-2">
                <ArrowLeftRight size={15} /> Reassign
              </Button>
              <Button className="h-10 px-8 text-[13px] font-bold bg-primary text-white shadow-sm shadow-primary/20">Resolve</Button>
            </div>
          </div>

          {/* ── 12-Column Grid Layout ─────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ── Main Content (8 Cols) ───────────────────── */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: "Vehicle Information", icon: <Car size={14} />, content: [incident.vehicle.id, incident.vehicle.model, incident.vehicle.vin] },
                  { title: "Driver Information", icon: <User size={14} />, content: [incident.driver.name, `ID: ${incident.driver.driverId}`, incident.driver.phone] },
                  { title: "Report Summary", icon: <AlertCircle size={14} />, content: [incident.report.date, `${incident.report.battery} Battery`, incident.report.stationId] },
                ].map((card, i) => (
                  <Card key={i} className="saas-card">
                    <CardHeader className="p-5 pb-2">
                      <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        {card.icon} {card.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 space-y-1">
                      <p className="text-[14px] font-bold text-foreground">{card.content[0]}</p>
                      <p className="text-[13px] text-muted-foreground font-medium">{card.content[1]}</p>
                      <p className="text-[11px] text-muted-foreground/60 font-mono mt-1">{card.content[2]}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Issue Details Card */}
              <Card className="saas-card overflow-hidden">
                <CardHeader className="px-6 py-4 border-b border-border/30 bg-muted/[0.02]">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[13px] font-bold text-foreground">Operational Diagnostics</CardTitle>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100 font-bold px-2 py-0 h-5 text-[10px] uppercase">
                      {incident.issueTitle}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                  <div className="bg-primary/[0.02] border-l-2 border-primary/40 px-6 py-4 rounded-r-lg">
                    <p className="text-[14px] text-foreground leading-[1.6] font-medium italic">
                      {incident.description}
                    </p>
                  </div>


                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {[
                      { label: "Category", value: incident.category },
                      { label: "BMS State", value: incident.bmsState, highlight: true },
                      { label: "Ambient", value: incident.ambientTemp },
                      { label: "Voltage", value: incident.systemVoltage },
                    ].map((item, i) => (
                      <div key={i} className="space-y-1">
                        <p className="label-text">{item.label}</p>
                        <p className={cn("text-[13px] font-bold", item.highlight ? "text-red-600" : "text-foreground")}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Evidence Gallery */}
              <Card className="saas-card overflow-hidden">
                <CardHeader className="px-6 py-4 border-b border-border/30 bg-muted/[0.02] flex flex-row items-center justify-between">
                  <CardTitle className="text-[13px] font-bold text-foreground">Collected Evidence</CardTitle>
                  <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold text-primary hover:bg-primary/5">
                    <Download size={14} className="mr-2" /> Download Package
                  </Button>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex gap-4 flex-wrap">
                    {incident.evidence.map((file, i) => (
                      <div key={i} className="w-[120px] h-[90px] rounded-lg bg-muted border border-border/40 overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all flex flex-col group">
                        <div className="flex-1 bg-gray-100 flex items-center justify-center">
                          <Car size={24} className="text-gray-300 group-hover:scale-110 transition-transform" />
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium px-2 py-1.5 truncate border-t border-border/30">
                          {file}
                        </p>
                      </div>
                    ))}
                    <div className="w-[120px] h-[90px] rounded-lg border-2 border-dashed border-border/60 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-muted/30 hover:border-primary/40 transition-all">
                      <ImagePlus size={18} className="text-muted-foreground/60" />
                      <span className="text-[10px] font-bold text-muted-foreground/60">Attach</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ── Sidebar Content (4 Cols) ────────────────── */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* AI Troubleshooting */}
              <Card className="saas-card">
                <CardHeader className="px-6 py-4 border-b border-border/30 bg-muted/[0.02]">
                  <CardTitle className="text-[13px] font-bold text-foreground flex items-center gap-2">
                    <Bot size={16} className="text-primary" /> AI Troubleshooting History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px]">
                    <div className="px-6 py-6 space-y-6">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Incident Session</p>
                      
                      <div className="space-y-6 relative">
                        {/* Timeline line */}
                        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border/40" />

                        {[
                          { sender: "Marcus Thorne", text: aiMessages[0].text, type: "driver" },
                          { sender: "FleetCore AI", text: aiMessages[1].text, type: "ai" },
                          { sender: "Automated Guidance", steps: automatedSteps, type: "steps" },
                          { sender: "Driver Feedback", text: aiMessages[2].text, type: "feedback" },
                        ].map((msg, i) => (
                          <div key={i} className="flex gap-4 relative">
                            <div className={cn(
                              "w-6 h-6 rounded-full shrink-0 flex items-center justify-center z-10 border-2 border-white",
                              msg.type === "ai" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                            )}>
                              {msg.type === "ai" ? <Bot size={12} /> : msg.type === "steps" ? <ClipboardList size={12} /> : <User size={12} />}
                            </div>
                            <div className="flex-1 space-y-2">
                              <p className={cn("text-[11px] font-bold", msg.type === "ai" ? "text-primary" : "text-foreground")}>
                                {msg.sender}
                              </p>
                              {msg.text && (
                                <div className="bg-white border border-border/40 rounded-lg p-3 shadow-sm">
                                  <p className="text-[12px] text-foreground leading-relaxed">{msg.text}</p>
                                </div>
                              )}
                              {msg.steps && (
                                <div className="space-y-2">
                                  {msg.steps.map((step, si) => (
                                    <div key={si} className="flex items-start gap-3 p-2 rounded-md bg-muted/20 border border-border/20">
                                      <span className="text-[10px] font-black text-primary mt-0.5">{si + 1}.</span>
                                      <p className="text-[11px] text-foreground/80 font-medium">{step}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Activity Log */}
              <Card className="saas-card">
                <CardHeader className="px-6 py-4 border-b border-border/30 bg-muted/[0.02]">
                  <CardTitle className="text-[13px] font-bold text-foreground flex items-center gap-2">
                    <Clock size={15} className="text-muted-foreground/60" /> Activity Stream
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {activityLog.map((log, i) => (
                      <div key={i} className="flex gap-4">
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-1.5 shrink-0",
                          log.dot === "red" ? "bg-red-500" : log.dot === "blue" ? "bg-primary" : "bg-border"
                        )} />
                        <div className="space-y-0.5">
                          <p className="text-[13px] font-bold text-foreground">{log.label}</p>
                          <p className="text-[11px] text-muted-foreground font-medium">{log.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </AppLayout>
  );
}

function ClipboardList({ size, className }: { size: number, className?: string }) {
  return <AlertCircle size={size} className={className} />;
}
