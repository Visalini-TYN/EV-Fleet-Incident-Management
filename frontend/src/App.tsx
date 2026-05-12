import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ManagerDashboard from "@/features/manager/pages/ManagerDashboard";
import IncidentQueue from "@/features/manager/pages/IncidentQueue";
import AuditLogPage from "@/features/manager/pages/AuditLogPage";
import IncidentDetail from "@/features/manager/pages/IncidentDetail";
import { SidebarProvider } from "@/components/ui/sidebar";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/manager" replace />} />
          <Route path="/manager" element={<ManagerDashboard />} />
          <Route path="/incident-queue" element={<IncidentQueue />} />
          <Route path="/audit-log" element={<AuditLogPage />} />
          <Route path="/incident/:incidentId" element={<IncidentDetail />} />
        </Routes>
      </SidebarProvider>
    </BrowserRouter>
  );
}

export default App;
