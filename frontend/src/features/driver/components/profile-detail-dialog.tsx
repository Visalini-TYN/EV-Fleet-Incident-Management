import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/features/auth/auth-context";

interface ProfileDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Fields excluded from the profile dialog.
 * `userType` is hidden per design (not meaningful to the driver).
 */
const HIDDEN_KEYS = new Set(["userType"]);

export function ProfileDetailDialog({
  open,
  onOpenChange,
}: ProfileDetailDialogProps) {
  const { profile } = useAuth();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Profile details</DialogTitle>
          <DialogDescription>
            Information returned by the backend for your account.
          </DialogDescription>
        </DialogHeader>

        {!profile && (
          <p className="py-6 text-sm text-muted-foreground">
            No profile data available.
          </p>
        )}

        {profile != null && typeof profile === "object" && (
          <ProfileFieldList data={profile as Record<string, unknown>} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ProfileFieldList({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data).filter(([key]) => !HIDDEN_KEYS.has(key));

  if (entries.length === 0) {
    return (
      <p className="py-6 text-sm text-muted-foreground">
        No profile fields to display.
      </p>
    );
  }

  return (
    <ScrollArea className="max-h-[60vh] pr-4">
      <dl className="space-y-3">
        {entries.map(([key, value], idx) => (
          <div key={key}>
            <div className="grid grid-cols-[1fr_2fr] gap-3 py-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {formatKey(key)}
              </dt>
              <dd className="text-sm break-words">{formatValue(value)}</dd>
            </div>
            {idx < entries.length - 1 && <Separator />}
          </div>
        ))}
      </dl>
    </ScrollArea>
  );
}

function formatKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

function formatValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground">—</span>;
  }

  if (typeof value === "boolean") {
    return (
      <Badge variant={value ? "default" : "outline"}>
        {value ? "Yes" : "No"}
      </Badge>
    );
  }

  if (typeof value === "string") {
    if (/^[A-Z_]+$/.test(value) && value.length < 30) {
      return <Badge variant="outline">{value}</Badge>;
    }
    return <span>{value}</span>;
  }

  if (typeof value === "number") {
    return <span className="font-mono">{value}</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0)
      return <span className="text-muted-foreground">—</span>;
    return (
      <ul className="space-y-1">
        {value.map((item, i) => (
          <li key={i}>{formatValue(item)}</li>
        ))}
      </ul>
    );
  }

  if (typeof value === "object") {
    return (
      <pre className="rounded bg-muted/50 p-2 text-xs overflow-x-auto">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  return <span>{String(value)}</span>;
}