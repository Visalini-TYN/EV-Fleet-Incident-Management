import AuthorizationForm from "@/features/auth/components/authorization-form";
import { useAuth } from "@/features/auth/auth-context";
import HomeforAdmin from "./admin/HomeforAdmin";
import ActiveIncidentsPage from "./manager/ActiveIncidentsPage";
import VendorsDashboard from "./vendor/vendorsDashboard";
import DriverDashboard from "@/features/driver/pages/DriverDashboard";

export default function Home() {
  const { status, role } = useAuth();
  const normalizedRole = role?.toLowerCase();

  if (status === "loading") {
    return null;
  }


  if (normalizedRole === "admin" ) {
    return <HomeforAdmin />;
  }
  if (normalizedRole === "vendor_admin") {
    return <VendorsDashboard />;
  }
  if (normalizedRole === "driver") {
    return <DriverDashboard />;
  }

  if (normalizedRole === "manager") {
    return <ActiveIncidentsPage/>
  }


  return <AuthorizationForm />;
}