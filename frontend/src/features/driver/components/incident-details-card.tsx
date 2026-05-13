import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { parseIncidentData } from "@/lib/api/incidents";
import type { IncidentRecord, IncidentStatus } from "@/lib/types";

interface IncidentDetailsCardProps {
  incident: IncidentRecord;
  driverName?: string | null;
  driverNameLoading?: boolean;
}

const STATUS_VARIANT: Record<
  IncidentStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
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

const CATEGORY_LABEL: Record<string, string> = {
  // New short-form categories
  BATTERY: "Battery",
  MOTOR: "Motor",
  SOFTWARE: "Software",
  CHARGING: "Charging",
  BRAKE: "Brake",
  TYRE: "Tyre",
  UNKNOWN: "Other / not sure",
  // Legacy categories — kept so old incidents in history still display nicely
  STARTING_ISSUE: "Starting issue",
  BATTERY_ISSUE: "Battery issue",
  CHARGING_ISSUE: "Charging issue",
  TIRE_ISSUE: "Tire issue",
  SOFTWARE_GLITCH: "Software glitch",
};

export function IncidentDetailsCard({
  incident,
  driverName,
  driverNameLoading = false,
}: IncidentDetailsCardProps) {
  const payload = parseIncidentData(incident.data);
  const description =
  payload?.description ?? payload?.issueDescription ?? "(no description)";
  const attachments = payload?.attachments ?? [];
  const categoryLabel =
    CATEGORY_LABEL[incident.issueCategory] ?? incident.issueCategory;

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Incident #{incident.id}</CardTitle>
          <Badge variant={STATUS_VARIANT[incident.status]}>
            {STATUS_LABEL[incident.status] ?? incident.status}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {new Date(incident.createdAt).toLocaleString()}
        </p>
      </CardHeader>
      <CardContent className="flex-1 space-y-5 overflow-y-auto">
        <DetailField label="Issue category">
          <Badge variant="outline">{categoryLabel}</Badge>
        </DetailField>

        <DetailField label="Description">
          <p className="whitespace-pre-wrap text-sm">{description}</p>
        </DetailField>

        <div className="grid grid-cols-2 gap-3">
          <DetailField label="Vehicle ID">
            <span className="font-mono text-sm">
              {incident.vehicleId || payload?.vehicleId || "—"}
            </span>
          </DetailField>
          <DetailField label="Driver name">
            <span className="text-sm">
              {driverNameLoading ? "Loading..." : driverName || "—"}
            </span>
          </DetailField>
          <DetailField label="Assigned vendor">
            <span className="text-sm">{incident.vendorId ?? "—"}</span>
          </DetailField>
        </div>

        {attachments.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Evidence
              </p>
              <div className="grid grid-cols-3 gap-2">
                {attachments.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded border"
                  >
                    {/\.(mp4|mov|webm)$/i.test(url) ? (
                      <div className="flex h-20 items-center justify-center bg-muted text-xs">
                        Video {i + 1}
                      </div>
                    ) : (
                      <img
                        src={url}
                        alt=""
                        className="h-20 w-full object-cover"
                      />
                    )}
                  </a>
                ))}
              </div>
            </div>
          </>
        )}

        {incident.escalationReason && (
          <DetailField label="Escalation reason">
            <p className="text-sm">{incident.escalationReason}</p>
          </DetailField>
        )}
      </CardContent>
    </Card>
  );
}

function DetailField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}
