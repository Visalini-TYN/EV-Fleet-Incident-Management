"use client";

import { Navigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Car,
  User,
  Info,
  Monitor,
  Zap,
  ArrowRightLeft,
} from "lucide-react";
import ManagerLayout from "./ManagerLayout";

const incidentDetailsById: Record<
  string,
  {
    status: string;
    updatedAt: string;
    vendor: string;
    vehicle: string;
    vehicleName: string;
    vin: string;
    driver: string;
    driverId: string;
    driverPhone: string;
    reportDate: string;
    battery: string;
    location: string;
    diagnosticTitle: string;
    diagnosticBadge: string;
    incidentSummary: string;
    userMessage: string;
    aiMessage: string;
    guidance: [string, string];
  }
> = {
  "INC-9921": {
    status: "Escalated",
    updatedAt: "4 minutes ago",
    vendor: "VoltService",
    vehicle: "EV-7704",
    vehicleName: "Tesla Model 3 Performance",
    vin: "5YJ3E1EB0LFX000000",
    driver: "Marcus Thorne",
    driverId: "DR-9012",
    driverPhone: "+1 (655) 012-3456",
    reportDate: "Oct 24, 14:22",
    battery: "88% Battery",
    location: "Supercharger-L42",
    diagnosticTitle: "Operational Diagnostics",
    diagnosticBadge: "Charging System Failure",
    incidentSummary:
      "While attempting to initiate a fast-charge sequence at the L42 hub, the vehicle displayed a 'DC Charge Port Locked' error. Cooling fans engaged at maximum RPM immediately, and charging was terminated by the BMS. Vehicle is currently immobilized on-site.",
    userMessage:
      "My charger is stuck and the fans are screaming. Screen says 'DC Charge Port Locked'. Help!",
    aiMessage:
      "Analyzing telemetry... Thermal runaway detected in charge port sensors. Initiating safe-mode shutdown.",
    guidance: [
      "Perform Emergency Manual Release via trunk cable.",
      "Disconnect primary high-voltage pyrofuse if fan noise persists.",
    ],
  },
  "INC-9854": {
    status: "Review",
    updatedAt: "12 minutes ago",
    vendor: "RapidCharge AI",
    vehicle: "EV-5512",
    vehicleName: "Nissan Ariya Platinum+",
    vin: "JN1AZ4EH9PM512345",
    driver: "Alyssa Chen",
    driverId: "DR-4471",
    driverPhone: "+1 (655) 111-2244",
    reportDate: "Oct 24, 10:05",
    battery: "61% Battery",
    location: "Downtown Lot C",
    diagnosticTitle: "Operational Diagnostics",
    diagnosticBadge: "Authentication Delay",
    incidentSummary:
      "The vehicle repeatedly rejected authentication at two public chargers, then dropped into a degraded charging state. The incident is under review while the vendor validates firmware and card authorization logs.",
    userMessage:
      "The charger keeps failing after I tap my card. It works sometimes, then stalls.",
    aiMessage:
      "Detected intermittent handshake failures with the charging station. Suspected firmware mismatch or authorization timeout.",
    guidance: [
      "Retry on a different charger after clearing the session.",
      "Escalate to vendor support if authentication failures continue.",
    ],
  },
  "INC-9712": {
    status: "Escalated",
    updatedAt: "21 minutes ago",
    vendor: "GridWorks",
    vehicle: "EV-2048",
    vehicleName: "Hyundai Ioniq 5",
    vin: "KM8KR4DF9RU123456",
    driver: "Noah Patel",
    driverId: "DR-2088",
    driverPhone: "+1 (655) 333-7788",
    reportDate: "Oct 23, 18:40",
    battery: "34% Battery",
    location: "North Depot",
    diagnosticTitle: "Operational Diagnostics",
    diagnosticBadge: "Thermal Alert",
    incidentSummary:
      "The vehicle reported a cooling-system fault after a long-distance trip. Telemetry indicates repeated thermal warnings and a hard stop to protect the battery pack.",
    userMessage:
      "I pulled over because the dashboard showed a cooling warning and the car slowed down.",
    aiMessage:
      "Thermal stability dropped below the safe threshold. Recommended a controlled shutdown and inspection of the battery cooling loop.",
    guidance: [
      "Arrange roadside support and tow to the nearest service bay.",
      "Inspect coolant circulation and battery thermal sensors before resuming service.",
    ],
  },
};

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const incident = id ? incidentDetailsById[id] : undefined;

  if (!incident) {
    return <Navigate to="/manager/active" replace />;
  }

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
                {incident.status}
              </Badge>
            </div>

            <p className="text-sm text-gray-500">
              Last updated{" "}
              <span className="font-medium">{incident.updatedAt}</span> • Assigned to{" "}
              <span className="font-semibold text-gray-700">
                {incident.vendor}
              </span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="shadow-sm"
            >
              Reject
            </Button>

            <Button
              variant="outline"
              className="gap-2 shadow-sm"
            >
              <ArrowRightLeft className="h-4 w-4" />
              Reassign
            </Button>

            <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
              Resolve
            </Button>
          </div>
        </section>

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Side */}
          <div className="space-y-8 lg:col-span-8">
            {/* Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Vehicle Card */}
              <Card className="border-gray-100 shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                    <Car className="h-4 w-4" />
                    Vehicle Information
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {incident.vehicle}
                    </h3>

                    <p className="text-gray-600">
                      {incident.vehicleName}
                    </p>

                    <p className="pt-1 font-mono text-xs uppercase text-gray-400">
                      {incident.vin}
                    </p>
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
                      {incident.driver}
                    </h3>

                    <p className="text-gray-600">
                      ID: {incident.driverId}
                    </p>

                    <p className="pt-1 text-xs text-gray-400">
                      {incident.driverPhone}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Summary Card */}
              <Card className="border-gray-100 shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                    <Info className="h-4 w-4" />
                    Report Summary
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {incident.reportDate}
                    </h3>

                    <p className="text-gray-600">
                      {incident.battery}
                    </p>

                    <p className="pt-1 text-xs text-gray-400">
                      {incident.location}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Diagnostics */}
            <Card className="border-gray-100 shadow-sm">
              <CardContent className="p-8">
                <div className="mb-10 flex items-start justify-between">
                  <h2 className="text-lg font-bold text-gray-900">
                    {incident.diagnosticTitle}
                  </h2>

                  <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-100 uppercase tracking-widest">
                    {incident.diagnosticBadge}
                  </Badge>
                </div>

                <div className="border-l-4 border-blue-500 py-2 pl-6">
                  <p className="text-lg italic leading-relaxed text-gray-700">
                    {incident.incidentSummary}
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

                  {/* User Message */}
                  <div className="relative flex gap-4">
                    <div className="z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-gray-200 bg-white">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>

                    <div className="flex-1 space-y-3">
                      <p className="text-xs font-bold uppercase tracking-tight text-gray-900">
                        {incident.driver}
                      </p>

                      <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 shadow-sm">
                        <p className="text-sm italic leading-relaxed text-gray-600">
                          {incident.userMessage}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="relative flex gap-4">
                    <div className="z-10 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600">
                      <Zap className="h-4 w-4 text-white" />
                    </div>

                    <div className="flex-1 space-y-3">
                      <p className="text-xs font-bold uppercase tracking-tight text-blue-600">
                        FleetCore AI
                      </p>

                      <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 shadow-sm">
                        <p className="text-sm italic leading-relaxed text-gray-600">
                          {incident.aiMessage}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Guidance */}
                  <div className="relative flex gap-4">
                    <div className="z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-gray-200 bg-white">
                      <Info className="h-4 w-4 text-gray-400" />
                    </div>

                    <div className="flex-1 space-y-3">
                      <p className="text-xs font-bold uppercase tracking-tight text-gray-900">
                        Automated Guidance
                      </p>

                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600">
                            1
                          </span>

                          <p className="text-sm text-gray-600">
                            {incident.guidance[0]}
                          </p>
                        </div>

                        <div className="flex gap-3">
                          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600">
                            2
                          </span>

                          <p className="text-sm text-gray-600">
                            {incident.guidance[1]}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </ManagerLayout>
  );
}