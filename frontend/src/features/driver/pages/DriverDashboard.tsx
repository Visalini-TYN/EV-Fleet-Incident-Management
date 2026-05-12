import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  BatteryFull,
  Car,
  FileWarning,
  Info,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/features/auth/auth-context";
import { vehiclesApi } from "@/lib/api/vehicles";
import type { Vehicle } from "@/lib/types";

/** Returns the first word of a full name, or "Driver" as fallback. */
function getFirstName(fullName: string | undefined | null): string {
  if (!fullName) return "Driver";
  const first = fullName.trim().split(/\s+/)[0];
  return first || "Driver";
}

/**
 * The /api/profile/me response doesn't include the user's numeric ID.
 * Read it from the JWT instead — the token's `userId` field is what the
 * backend assigns to each row (vehicle.userId, complaint.customerId, etc.).
 */
function getUserIdFromToken(): number | undefined {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return undefined;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.userId === "number" ? payload.userId : undefined;
  } catch {
    return undefined;
  }
}
export default function DriverDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const profileData = profile as
  | { fullName?: string; status?: string }
  | null;
  const firstName = getFirstName(profileData?.fullName);
  const userId = getUserIdFromToken();
  const status = profileData?.status ?? null;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [vehicleError, setVehicleError] = useState<string | null>(null);

  // Fetch the driver's assigned vehicle on mount.
  useEffect(() => {
    if (userId === undefined) return;
    let cancelled = false;
    setVehicleLoading(true);
    setVehicleError(null);
    vehiclesApi
      .getMyVehicle(userId)
      .then((v) => {
        if (!cancelled) setVehicle(v);
      })
      .catch((e) => {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : "Failed to load vehicle";
          setVehicleError(msg);
        }
      })
      .finally(() => {
        if (!cancelled) setVehicleLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 space-y-6 p-4 sm:p-6">
          {/* Welcome greeting */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome, {firstName}
            </h1>
            {status && (
              <Badge variant="secondary" className="self-start sm:self-auto">
                {status}
              </Badge>
            )}
          </div>

          {/* Active vehicle — full width, real data */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">Active vehicle</CardTitle>
              <Car className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {vehicleLoading && (
                <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading your assigned vehicle…
                </div>
              )}

              {vehicleError && !vehicleLoading && (
                <p className="py-4 text-sm text-destructive">{vehicleError}</p>
              )}

              {!vehicleLoading && !vehicleError && !vehicle && (
                <p className="py-4 text-sm text-muted-foreground">
                  No vehicle is currently assigned to your account. Contact your
                  fleet manager to get assigned.
                </p>
              )}

              {vehicle && (
                <div className="grid gap-6 md:grid-cols-4">
                  <Field
                    label="Make & model"
                    value={`${vehicle.make} ${vehicle.model}`}
                  />
                  <Field label="License plate" value={vehicle.licensePlate} mono />
                  <Field label="Year" value={vehicle.yearOfManufacture} />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Status
                    </p>
                    <Badge variant="outline" className="mt-1">
                      {vehicle.status}
                    </Badge>
                  </div>

                  <Field label="VIN" value={vehicle.vin} mono />
                  <Field label="Chassis no." value={vehicle.chassisNo} mono />
                  <div className="md:col-span-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Battery capacity
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-sm font-medium">
                      <BatteryFull className="h-4 w-4 text-primary" />
                      {vehicle.batteryCapacityKwh} kWh
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Report incident — full width */}
          <Card>
            <CardContent className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileWarning className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      Report an incident
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Log any vehicle issue, safety concern, or operational
                      problem. The AI assistant will try to help right away,
                      and our team takes over if you need a real fix.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    Emergency? Call dispatch directly — this form is for
                    non-urgent issues.
                  </p>
                </div>
              </div>

              <Button
                size="lg"
                onClick={() => navigate("/driver/report")}
                className="md:w-auto"
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                Report new incident
              </Button>
            </CardContent>
          </Card>

          <Separator className="my-2" />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | number | null;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1 text-sm ${
          mono ? "font-mono font-semibold" : "font-medium"
        }`}
      >
        {value !== null && value !== undefined && value !== "" ? value : "—"}
      </p>
    </div>
  );
}