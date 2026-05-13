"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
  Filter,
  Download,
  TrendingUp,
  TriangleAlert,
  ShieldCheck,
} from "lucide-react";
import ManagerLayout from "./ManagerLayout";

export default function AuditLogPage() {
  const logs = [
    {
      id: "#LOG-7821",
      action: "STATUS_UPDATE",
      actionColor: "bg-blue-50 text-blue-600",
      vehicleId: "EV-9021",
      complaintId: "C-1044",
      createdAt: "Oct 24, 14:22",
      previousStatus: "Standby",
      newStatus: "In Transit",
      statusDot: "bg-blue-600",
      performedBy: "John Doe",
      role: "System Role",
      initials: "JD",
    },
    {
      id: "#LOG-7820",
      action: "GEO_FENCE_EXIT",
      actionColor: "bg-green-50 text-green-600",
      vehicleId: "EV-4412",
      complaintId: "C-2109",
      createdAt: "Oct 24, 14:15",
      previousStatus: "In Transit",
      newStatus: "Off Route",
      statusDot: "bg-yellow-500",
      performedBy: "Auto System",
      role: "Automated Trigger",
      initials: "AS",
    },
  ];

  return (
    <ManagerLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Audit Log
            </h1>

            <p className="max-w-2xl text-[#5d5e62]">
              Review and track every administrative action, status
              change, and system modification within the fleet ecosystem.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="shadow-sm"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter Logs
            </Button>

            <Button
              variant="outline"
              className="shadow-sm"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </section>

        {/* Summary Cards */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Total Events */}
          <Card className="border-gray-100 shadow-sm">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="rounded-lg bg-blue-50 p-3">
                <TrendingUp className="h-8 w-8 text-[#0070c0]" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#5d5e62]">
                  Total Events
                </p>

                <p className="my-1 text-4xl font-bold">
                  14,282
                </p>

                <p className="text-sm font-medium text-green-600">
                  ↑ 12% from last week
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Alerts */}
          <Card className="border-gray-100 shadow-sm">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="rounded-lg bg-red-50 p-3">
                <TriangleAlert className="h-8 w-8 text-red-600" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#5d5e62]">
                  Security Alerts
                </p>

                <p className="my-1 text-4xl font-bold">
                  24
                </p>

                <p className="text-sm font-medium text-red-600">
                  Requires manual review
                </p>
              </div>
            </CardContent>
          </Card>

          {/* System Integrity */}
          <Card className="relative overflow-hidden border-0 bg-[#0070c0] text-white shadow-md">
            <CardContent className="relative z-10 flex h-full flex-col justify-between p-6">
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 opacity-80" />

                  <span className="text-xs font-bold uppercase tracking-widest opacity-80">
                    System Integrity
                  </span>
                </div>

                <h3 className="mb-4 text-xl font-bold leading-tight">
                  Your fleet data is secure and verified.
                </h3>
              </div>

              <div className="flex gap-4 border-t border-white/20 pt-4 text-xs font-bold">
                <a
                  href="#"
                  className="hover:underline"
                >
                  Critical Path Logs
                </a>

                <a
                  href="#"
                  className="hover:underline"
                >
                  Vehicle Dispatch
                </a>
              </div>
            </CardContent>

            {/* Background Decoration */}
            <ShieldCheck className="absolute -bottom-4 -right-4 h-32 w-32 opacity-10" />
          </Card>
        </section>

        {/* Activity Table */}
        <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          {/* Table Header */}
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-lg font-bold">
              Activity Stream
            </h2>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-[#5d5e62]">
                  <th className="px-6 py-4">Log ID</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Vehicle ID</th>
                  <th className="px-6 py-4">Complaint ID</th>
                  <th className="px-6 py-4">Created At</th>
                  <th className="px-6 py-4">
                    Previous Status
                  </th>
                  <th className="px-6 py-4">New Status</th>
                  <th className="px-6 py-4">
                    Performed By
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50 text-sm">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="transition-colors hover:bg-gray-50/50"
                  >
                    <td className="px-6 py-5 font-bold text-[#0070c0]">
                      {log.id}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded px-2 py-1 text-[10px] font-bold ${log.actionColor}`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="px-6 py-5 font-bold">
                      {log.vehicleId}
                    </td>

                    <td className="px-6 py-5 text-[#5d5e62]">
                      {log.complaintId}
                    </td>

                    <td className="px-6 py-5 text-[#5d5e62]">
                      {log.createdAt}
                    </td>

                    <td className="px-6 py-5 text-[#5d5e62]">
                      {log.previousStatus}
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <span
                          className={`mr-2 h-2 w-2 rounded-full ${log.statusDot}`}
                        />

                        <span className="font-bold">
                          {log.newStatus}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-500">
                          {log.initials}
                        </div>

                        <div className="leading-tight">
                          <p className="text-xs font-bold">
                            {log.performedBy}
                          </p>

                          <p className="text-[10px] text-[#5d5e62]">
                            {log.role}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4 text-xs text-[#5d5e62]">
            <p>Showing 1-10 of 14,282 logs</p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
              >
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        </section>
      </div>
    </ManagerLayout>
  );
}