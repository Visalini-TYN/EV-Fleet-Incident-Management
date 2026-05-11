import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DriverIncidentsProvider } from "@/features/driver/hooks/use-driver-incidents";
import DriverDashboard from "@/features/driver/pages/DriverDashboard";
import HistoryPage from "@/features/driver/pages/DriverHistoryPage";

export default function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <DriverIncidentsProvider>
          <Routes>
            <Route path="/" element={<DriverDashboard />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DriverIncidentsProvider>
      </BrowserRouter>
    </TooltipProvider>
  );
}