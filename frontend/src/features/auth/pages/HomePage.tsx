import AuthorizationForm from "@/features/auth/components/authorization-form";
import { useAuth } from "@/features/auth/auth-context";
import { normalizeRole } from "@/lib/utils";
import ApprovalSuccessPage from "@/features/auth/pages/admin/ApprovalSuccessPage";
import HomeforAdmin from "./admin/HomeforAdmin";
import ActiveIncidentsPage from "./manager/ActiveIncidentsPage";
import VendorDashboard from "./vendor/vendorsDashboard";

export default function Home() {
  const { status, role } = useAuth();
  const normalizedRole = normalizeRole(role);

  if (status === "loading") {
    return null;
  }

  const isAdmin = normalizedRole === "admin";
  const isVendor = normalizedRole === "vendor" || normalizedRole === "vendor_admin" || normalizedRole === "vendor-admin";

  if (isAdmin) {
    return <HomeforAdmin />;
  }

  if (isVendor) {
    return <VendorDashboard />;
  }

  if (normalizedRole === "driver") {
    return <ApprovalSuccessPage />;
  }

  if (normalizedRole === "manager") {
    return <ActiveIncidentsPage/>
  }


  return <AuthorizationForm />;
}