import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { useDriverIncidents } from "../hooks/use-driver-incidents";
import type { IncidentRecord, IncidentStatus } from "@/lib/types";

interface IncidentDetailDialogProps {
  incidentId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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
  IN_PROGRESS: "AI is working",
  ASSIGNED_TO_VENDOR: "Assigned to vendor",
  ESCALATED_TO_MANAGER: "Escalated to manager",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
};

export function IncidentDetailDialog({
  incidentId,
  open,
  onOpenChange,
}: IncidentDetailDialogProps) {
  const { getById, parseData } = useDriverIncidents();
  const [record, setRecord] = useState<IncidentRecord | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || incidentId === null) {
      setRecord(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void getById(incidentId).then((r) => {
      if (!cancelled) {
        setRecord(r);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [open, incidentId, getById]);

  const payload = record ? parseData(record) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Incident {record ? `#${record.id}` : ""}
          </DialogTitle>
          <DialogDescription>
            {record
              ? new Date(record.createdAt).toLocaleString()
              : "Loading incident details..."}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
          </div>
        )}

        {!loading && record && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={STATUS_VARIANT[record.status]}>
                {STATUS_LABEL[record.status] ?? record.status}
              </Badge>
              <Badge variant="outline">{record.priority}</Badge>
              <Badge variant="outline">{record.issueCategory}</Badge>
            </div>

            <Section label="Description">
              {payload?.issueDescription || "(no description)"}
            </Section>

            <div className="grid gap-3 sm:grid-cols-2">
              <Section label="Vehicle">
                {record.vehicleId || payload?.vehicleId || "—"}
              </Section>
              <Section label="Location">
                {payload?.location ||
                  (record.latitude !== null && record.longitude !== null
                    ? `${record.latitude}, ${record.longitude}`
                    : "—")}
              </Section>
              <Section label="Assigned vendor">{record.vendorId ?? "—"}</Section>
              <Section label="Technician">{record.technicianId ?? "—"}</Section>
            </div>

            {payload?.attachments && payload.attachments.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="mb-2 text-sm font-medium">Evidence</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {payload.attachments.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block overflow-hidden rounded border"
                      >
                        {/\.(mp4|mov|webm)$/i.test(url) ? (
                          <div className="flex h-24 items-center justify-center bg-muted text-xs">
                            Video {i + 1}
                          </div>
                        ) : (
                          <img src={url} alt="" className="h-24 w-full object-cover" />
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )}

            {record.escalationReason && (
              <Section label="Escalation reason">{record.escalationReason}</Section>
            )}

            {record.workSummary && (
              <Section label="Timeline">
                <pre className="whitespace-pre-wrap rounded border bg-muted/50 p-3 text-xs">
                  {record.workSummary}
                </pre>
              </Section>
            )}
          </div>
        )}

        {!loading && !record && incidentId !== null && (
          <p className="py-6 text-sm text-muted-foreground">
            Couldn't load this incident.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="text-sm">{children}</div>
    </div>
  );
}