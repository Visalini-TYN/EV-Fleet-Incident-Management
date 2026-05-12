import { AppLayout } from "../../../components/shared/app-layout";
import DashboardHeader from "../../../components/shared/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Filter, Download, ShieldCheck, ChevronRight,
  Activity, ShieldAlert, Database
} from "lucide-react";

import Footer from "../../../components/shared/footer";
import { cn } from "@/lib/utils";

const logs = [
  { id: "#LOG-7821", action: "STATUS_UPDATE", vehicle: "EV-9021", complaint: "C-1044", date: "Oct 24, 14:22", prevStatus: "Standby", newStatus: "In Transit", user: "John Doe" },
  { id: "#LOG-7820", action: "EMERGENCY_STOP", vehicle: "EV-4412", complaint: "C-2291", date: "Oct 24, 14:22", prevStatus: "In Transit", newStatus: "Halt", user: "System Auto" },
  { id: "#LOG-7819", action: "CHARGING_START", vehicle: "EV-1002", complaint: "—", date: "Oct 24, 14:22", prevStatus: "Standby", newStatus: "Charging", user: "Alex Mercer" },
  { id: "#LOG-7818", action: "ROUTE_RECALC", vehicle: "EV-8821", complaint: "C-1099", date: "Oct 24, 14:22", prevStatus: "In Transit", newStatus: "In Transit", user: "System Auto" },
];

export default function AuditLogPage() {
  return (
    <AppLayout activeHref="/audit-log">
      <DashboardHeader title="System Audit Logs" />

      <main className="flex-1 overflow-y-auto bg-muted/[0.03]">
        <div className="max-w-[1400px] mx-auto px-8 py-8 space-y-8">
          
          {/* Header Section */}
          <div className="flex items-end justify-between border-b border-border/40 pb-8">
            <div className="space-y-4">
              <h1 className="text-[32px] font-bold text-foreground tracking-tight">Audit Log</h1>
              <p className="text-muted-foreground text-[14px] font-medium max-w-[600px]">
                Review and track every administrative action, status change, and system modification within the fleet ecosystem.
              </p>
            </div>
            <div className="flex gap-3 mb-1">
              <Button variant="outline" className="h-10 px-5 text-[13px] font-bold border-border/80 gap-2">
                <Filter size={15} /> Filter Logs
              </Button>
              <Button variant="outline" className="h-10 px-5 text-[13px] font-bold border-border/80 gap-2">
                <Download size={15} /> Export
              </Button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="saas-card">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-primary shadow-sm border border-blue-100">
                  <Activity size={24} />
                </div>
                <div>
                  <p className="label-text">Total Events</p>
                  <p className="metric-value mt-1">14,282</p>
                  <p className="text-[11px] font-bold text-emerald-600 mt-1">↑ 12% from last week</p>
                </div>
              </CardContent>
            </Card>

            <Card className="saas-card">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shadow-sm border border-red-100">
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <p className="label-text">Security Alerts</p>
                  <p className="metric-value mt-1">24</p>
                  <p className="text-[11px] font-bold text-red-600 mt-1">Requires manual review</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary shadow-lg shadow-primary/20 border-none rounded-xl p-6 text-white relative overflow-hidden group">
              <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-500">
                <ShieldCheck size={160} />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest opacity-80">
                  <Database size={12} /> System Integrity
                </div>
                <p className="text-xl font-bold leading-tight">Your fleet data is secure and verified.</p>
                <div className="flex gap-4">
                  <button className="text-[11px] font-black underline underline-offset-4 hover:opacity-80 transition-opacity">Critical Path Logs</button>
                  <button className="text-[11px] font-black underline underline-offset-4 hover:opacity-80 transition-opacity">Vehicle Dispatch</button>
                </div>
              </div>
            </Card>
          </div>

          {/* Table Section */}
          <Card className="saas-card overflow-hidden">
            <CardHeader className="px-8 py-6 border-b border-border/40 bg-muted/[0.02]">
              <CardTitle className="text-[16px] font-bold text-foreground">Activity Stream</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="saas-table-header px-8">Log ID</TableHead>
                    <TableHead className="saas-table-header px-6">Action</TableHead>
                    <TableHead className="saas-table-header px-6">Vehicle ID</TableHead>
                    <TableHead className="saas-table-header px-6">Compliant ID</TableHead>
                    <TableHead className="saas-table-header px-6">Created At</TableHead>
                    <TableHead className="saas-table-header px-6">Previous Status</TableHead>
                    <TableHead className="saas-table-header px-6">New Status</TableHead>
                    <TableHead className="saas-table-header px-8">Performed By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} className="saas-table-row">
                      <TableCell className="px-8 py-5 text-[13px] font-bold text-primary hover:underline cursor-pointer">{log.id}</TableCell>
                      <TableCell className="px-6 py-5">
                        <Badge variant="outline" className="text-[10px] font-black border-primary/20 bg-primary/5 text-primary tracking-tighter">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-5 text-[13px] font-bold text-foreground">{log.vehicle}</TableCell>
                      <TableCell className="px-6 py-5 text-[13px] text-muted-foreground font-medium">{log.complaint}</TableCell>
                      <TableCell className="px-6 py-5 text-[13px] text-muted-foreground">{log.date}</TableCell>
                      <TableCell className="px-6 py-5 text-[13px] font-medium text-foreground/80">{log.prevStatus}</TableCell>
                      <TableCell className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            log.newStatus === "Halt" ? "bg-red-500" : log.newStatus === "Charging" ? "bg-emerald-500" : "bg-primary"
                          )} />
                          <span className="text-[13px] font-bold text-foreground">{log.newStatus}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground border border-border/40">
                            {log.user.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-[12px] font-bold text-foreground">{log.user}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">System Role</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="px-8 py-5 border-t border-border/20 flex items-center justify-between text-[12px] font-bold text-muted-foreground bg-muted/5">
                <p>Showing 1-10 of 14,282 logs</p>
                <div className="flex gap-6 uppercase tracking-widest">
                  <button className="hover:text-foreground transition-colors">Previous</button>
                  <button className="hover:text-foreground transition-colors">Next</button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Policy Banner */}
          <Card className="border border-dashed border-border/80 bg-muted/[0.02] rounded-xl overflow-hidden shadow-none">
            <CardContent className="p-8 flex items-center gap-8">
              <div className="w-16 h-16 rounded-full border-2 border-primary/20 flex items-center justify-center text-primary bg-white shadow-sm shrink-0">
                <ShieldCheck size={32} />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-[16px] font-bold text-foreground tracking-tight">Retention Policy Active</h3>
                <p className="text-[14px] text-muted-foreground font-medium leading-relaxed max-w-[800px]">
                  Audit logs are retained for 365 days in accordance with the Enterprise Security Protocol. Logs older than 1 year are automatically compressed and moved to long-term encrypted storage vault.
                </p>
              </div>
              <Button variant="ghost" className="text-primary font-bold text-[13px] hover:bg-primary/5 px-6">
                Security Protocol Details <ChevronRight size={16} className="ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </AppLayout>
  );
}
