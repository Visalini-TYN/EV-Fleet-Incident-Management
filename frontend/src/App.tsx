import { type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/features/auth/auth-context";
import Login from "@/features/auth/pages/LoginPage";
import Signup from "@/features/auth/pages/SignupPage";
import Home from "@/features/auth/pages/HomePage";
import AdminOnboardingPage from "@/features/auth/pages/admin/AdminOnboardingPage";
import { DriverIncidentsProvider } from "@/features/driver/hooks/use-driver-incidents";
import DriverDashboard from "@/features/driver/pages/DriverDashboard";
import IncidentReportPage from "@/features/driver/pages/IncidentReportPage";
import DriverHistoryPage from "@/features/driver/pages/DriverHistoryPage";
import "./App.css";
import AdminVehiclePage from "./features/auth/pages/admin/AdminVehiclePage";


function AuthGate() {
  const { status, role } = useAuth();
  const normalizedRole = role?.toLowerCase();

  if (status === "loading") {
    return null;
  }

  console.log("Auth role:", role);



  if (status !== "authenticated") {
    return <Navigate to="/login" replace />;
  }

  return normalizedRole === "driver" ? (
    <Navigate to="/driver" replace />
  ) : (
    <Navigate to="/home" replace />
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();

  if (status === "loading") {
    return null;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicOnly({ children }: { children: ReactNode }) {
  const { status } = useAuth();

  if (status === "loading") {
    return null;
  }

  if (status === "authenticated") {
    return <Navigate to="/driver" replace />;
  }

  return <>{children}</>;
}

function RequireRole({
  children,
  allowedRoles,
  redirectTo = "/home",
}: {
  children: ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}) {
  const { status, role } = useAuth();
  const normalizedRole = role?.toLowerCase();
  // Treat vendor_admin (and variants) as admin per Home page logic.
  const normalizedRoleCanonical =
    normalizedRole === "vendor_admin" || normalizedRole === "vendor-admin"
      ? "admin"
      : normalizedRole;
  const allowedRolesNormalized = allowedRoles.map((item) => item.toLowerCase());

  if (status === "loading") {
    return null;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  console.log("RequireRole role:", role);

  if (!normalizedRoleCanonical || !allowedRolesNormalized.includes(normalizedRoleCanonical)) {
    return <Navigate to={redirectTo} replace />;
  }



  return <>{children}</>;
}

function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthGate />} />
          <Route
            path="/home"
            element={
              <RequireAuth>
                <Home />
              </RequireAuth>
            }
          />
          <Route
            path="/login"
            element={
              <PublicOnly>
                <Login />
              </PublicOnly>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicOnly>
                <Signup />
              </PublicOnly>
            }
          />
          {/* Driver routes — protected, wrapped in DriverIncidentsProvider */}
          <Route
            path="/driver"
            element={
              <RequireRole allowedRoles={["driver"]}>
                <DriverIncidentsProvider>
                  <DriverDashboard />
                </DriverIncidentsProvider>
              </RequireRole>
            }
          />
          <Route
            path="/driver/report"
            element={
              <RequireAuth>
                <DriverIncidentsProvider>
                  <IncidentReportPage />
                </DriverIncidentsProvider>
              </RequireAuth>
            }
          />
          <Route
            path="/driver/history"
            element={
              <RequireRole allowedRoles={["driver"]}>
                <DriverIncidentsProvider>
                  <DriverHistoryPage />
                </DriverIncidentsProvider>
              </RequireRole>
            }
          />
          <Route
            path="/admin/onboarding"
            element={
              <RequireRole allowedRoles={["admin"]}>
                <AdminOnboardingPage />
              </RequireRole>
            }
          />
          <Route
            path="/admin/vehicle"
            element={
              <RequireRole allowedRoles={["admin"]}>
                <AdminVehiclePage />
              </RequireRole>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
}

export default App;