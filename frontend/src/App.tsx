import { Routes, Route } from "react-router-dom";
import ManagerDashboard from "./features/manager/pages/ManagerDashboard";
import IncidentQueue from "./features/manager/pages/IncidentQueue";
import IncidentDetail from "./features/manager/pages/IncidentDetail";
import AuditLogPage from "./features/manager/pages/AuditLogPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ManagerDashboard />} />
      <Route path="/incident-queue" element={<IncidentQueue />} />
      <Route path="/audit-log" element={<AuditLogPage />} />
      <Route path="/incident/:id" element={<IncidentDetail />} />
    </Routes>
  );
}