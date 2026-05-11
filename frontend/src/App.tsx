import { type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/features/auth/auth-context";
import Login from "@/features/auth/pages/LoginPage";
import Signup from "@/features/auth/pages/SignupPage";
import Home from "@/features/auth/pages/HomePage";
import { DriverIncidentsProvider } from "@/features/driver/hooks/use-driver-incidents";
import DriverDashboard from "@/features/driver/pages/DriverDashboard";
import DriverHistoryPage from "@/features/driver/pages/DriverHistoryPage";
import "./App.css";

function AuthGate() {
  const { status } = useAuth();

  if (status === "loading") {
    return null;
  }

  return status === "authenticated" ? (
    <Navigate to="/driver" replace />
  ) : (
    <Navigate to="/login" replace />
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
              <RequireAuth>
                <DriverIncidentsProvider>
                  <DriverDashboard />
                </DriverIncidentsProvider>
              </RequireAuth>
            }
          />
          <Route
            path="/driver/history"
            element={
              <RequireAuth>
                <DriverIncidentsProvider>
                  <DriverHistoryPage />
                </DriverIncidentsProvider>
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
}

export default App;