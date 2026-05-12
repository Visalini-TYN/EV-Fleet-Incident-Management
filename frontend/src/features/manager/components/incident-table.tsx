import { useNavigate } from "react-router-dom";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter, Download, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const allIncidents = [
  { id: "INC-9921", priority: "Critical", vendor: "VoltService", time: "4h 12m", status: "Escalated" },
  { id: "INC-9854", priority: "High", vendor: "RapidCharge AI", time: "2h 45m", status: "Review" },
  { id: "INC-9830", priority: "High", vendor: "EV-Flow Partners", time: "6h 10m", status: "Escalated" },
  { id: "INC-9781", priority: "Medium", vendor: "GridOps Ltd", time: "1d 4h", status: "Resolved" },
];

const priorityStyles: Record<string, string> = {
  Critical: "bg-red-50 text-red-700 border-red-100",
  High: "bg-orange-50 text-orange-700 border-orange-100",
  Medium: "bg-blue-50 text-blue-700 border-blue-100",
};

const statusStyles: Record<string, string> = {
  Escalated: "bg-red-50 text-red-700 border-red-200",
  Review: "bg-slate-100 text-slate-700 border-slate-200",
  Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function IncidentTable() {
  const navigate = useNavigate();

  return (
    <Card className="saas-card overflow-hidden">
      <CardHeader className="px-8 py-6 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-[16px] font-bold text-foreground tracking-tight">
              Escalated Incident Queue
            </CardTitle>
            <p className="text-[12px] text-muted-foreground font-medium">
              Real-time feed of incidents requiring immediate intervention.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 text-[12px] font-semibold gap-2 px-3 border-border/60 hover:bg-muted/50">
              <Filter size={14} className="text-muted-foreground/60" /> Filter
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-[12px] font-semibold gap-2 px-3 border-border/60 hover:bg-muted/50">
              <Download size={14} className="text-muted-foreground/60" /> Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/10">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="saas-table-header px-8">Incident ID</TableHead>
              <TableHead className="saas-table-header px-6">Priority</TableHead>
              <TableHead className="saas-table-header px-6">Assigned Vendor</TableHead>
              <TableHead className="saas-table-header px-6">Time Elapsed</TableHead>
              <TableHead className="saas-table-header px-6">Status</TableHead>
              <TableHead className="saas-table-header px-8 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allIncidents.map((inc) => (
              <TableRow key={inc.id} className="saas-table-row group">
                <TableCell className="px-8 py-5 text-[13px] font-bold text-foreground">
                  {inc.id}
                </TableCell>
                <TableCell className="px-6 py-5">
                  <span className={cn("saas-badge", priorityStyles[inc.priority])}>
                    {inc.priority}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-5 text-[13px] font-medium text-foreground/80">{inc.vendor}</TableCell>
                <TableCell className="px-6 py-5 text-[13px] text-muted-foreground">{inc.time}</TableCell>
                <TableCell className="px-6 py-5">
                  <span className={cn("saas-badge", statusStyles[inc.status])}>
                    {inc.status}
                  </span>
                </TableCell>
                <TableCell className="px-8 py-5 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[12px] font-bold text-primary hover:bg-primary/5 px-2 rounded-md transition-all group-hover:translate-x-1"
                    onClick={() => navigate(`/incident/${inc.id}`)}
                  >
                    View <ChevronRight size={14} className="ml-1" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="px-8 py-4 border-t border-border/20 flex items-center justify-between text-[12px] font-medium text-muted-foreground bg-muted/5">
          <p>Showing 1-4 of 42 incidents</p>
          <div className="flex gap-4">
            <button className="hover:text-foreground transition-colors">Previous</button>
            <button className="hover:text-foreground transition-colors">Next</button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}