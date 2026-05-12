import { useState } from "react";
import { ClipboardList, Filter, Download } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const logs = [
  {
    id: "#4812",
    action: "Status Change",
    complaintId: "INC-8832",
    createdAt: "2023-10-27\n14:45",
    vehicleId: "EV-202",
    prevStatus: "Pending",
    newStatus: "Escalated",
    prevVariant: "outline" as const,
    newVariant: "yellow" as const,
    avatarBg: "#0d4f8b",
    initials: "AA",
  },
  {
    id: "#4811",
    action: "Vendor Assignment",
    complaintId: "INC-9910",
    createdAt: "2023-10-27\n13:30",
    vehicleId: "EV-405",
    prevStatus: "Unassigned",
    newStatus: "Assigned",
    prevVariant: "outline" as const,
    newVariant: "blue" as const,
    avatarBg: "#92400e",
    initials: "BJ",
  },
];

const newStatusCls: Record<string, string> = {
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-300",
  blue:   "bg-blue-100 text-blue-700 border-blue-300",
  green:  "bg-green-100 text-green-700 border-green-300",
};

export default function AuditLog() {
  const [page, setPage] = useState(1);
  const totalEntries = 1204;
  const pageSize = 25;

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ClipboardList size={16} className="text-muted-foreground" />
            <span className="text-base font-bold text-foreground">System Audit Log</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Filter size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Filter logs..."
                className="pl-7 h-7 text-xs w-[160px] bg-muted/40 border-border"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7">
              <Download size={12} /> Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="px-5 text-xs font-bold text-muted-foreground uppercase tracking-wider">ID</TableHead>
              <TableHead className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Action</TableHead>
              <TableHead className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Complaint ID</TableHead>
              <TableHead className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Created At</TableHead>
              <TableHead className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Vehicle ID</TableHead>
              <TableHead className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Previous Status</TableHead>
              <TableHead className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">New Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} className="hover:bg-blue-50/30">
                <TableCell className="px-5 py-3.5 text-sm font-semibold text-foreground">
                  {log.id}
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 shrink-0">
                      <AvatarFallback
                        className="text-white text-[9px] font-bold"
                        style={{ background: log.avatarBg }}
                      >
                        {log.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold text-foreground">{log.action}</span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3.5 text-sm font-semibold text-[#0d4f8b]">
                  {log.complaintId}
                </TableCell>
                <TableCell className="px-4 py-3.5 text-xs text-muted-foreground whitespace-pre-line">
                  {log.createdAt}
                </TableCell>
                <TableCell className="px-4 py-3.5 text-sm text-foreground">
                  {log.vehicleId}
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <Badge variant="outline" className="text-[11px] font-medium">
                    {log.prevStatus}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                    newStatusCls[log.newVariant]
                  )}>
                    {log.newStatus}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20">
          <span className="text-xs text-muted-foreground">
            Showing 1-{pageSize} of {totalEntries.toLocaleString()} entries
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs h-7 px-3"
              disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-7 px-3"
              disabled={page * pageSize >= totalEntries} onClick={() => setPage(p => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}