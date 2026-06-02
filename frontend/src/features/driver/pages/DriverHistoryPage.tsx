import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, RefreshCw } from "lucide-react";
import { useDriverIncidents } from "../hooks/use-driver-incidents";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { IncidentStatus } from "@/lib/types";

const STATUS_VARIANT: Record<IncidentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  OPEN: "outline",
  IN_PROGRESS: "secondary",
  ASSIGNED_TO_VENDOR: "secondary",
  ESCALATED_TO_MANAGER: "destructive",
  RESOLVED: "default",
  REJECTED: "destructive",
};

const STATUS_LABEL: Record<IncidentStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "AI working",
  ASSIGNED_TO_VENDOR: "With vendor",
  ESCALATED_TO_MANAGER: "Escalated",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
};

export default function HistoryPage() {
  const navigate = useNavigate();
  const { incidents, loading, error, refresh, parseData } = useDriverIncidents();

  const openDetails = (id: number) => {
    navigate(`/driver/history/${id}`);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 space-y-6 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Incident history</h1>
              <p className="text-sm text-muted-foreground">
                Click a row to view the full details and chat history.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refresh()}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>

          {error && (
            <div className="rounded border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Your incidents</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && incidents.length === 0 ? (
                <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                </div>
              ) : incidents.length === 0 ? (
                <p className="py-6 text-sm text-muted-foreground">
                  You haven't reported any incidents yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Reported</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incidents.map((inc) => {
                      const payload = parseData(inc);
                      return (
                        <TableRow
                          key={inc.id}
                          onClick={() => openDetails(inc.id)}
                          className="cursor-pointer hover:bg-muted/50"
                        >
                          <TableCell className="font-mono text-xs">
                            #{inc.id}
                          </TableCell>
                          <TableCell>{inc.issueCategory}</TableCell>
                          <TableCell>
                            {inc.vehicleId || payload?.vehicleId || "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(inc.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={STATUS_VARIANT[inc.status]}>
                              {STATUS_LABEL[inc.status] ?? inc.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}