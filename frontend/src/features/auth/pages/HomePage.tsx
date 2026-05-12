import AuthorizationForm from "@/features/auth/components/authorization-form";
import { useAuth } from "@/features/auth/auth-context";
import ApprovalSuccessPage from "@/features/auth/pages/admin/ApprovalSuccessPage";
import HomeforAdmin from "./admin/HomeforAdmin";

export default function Home() {
  const { status, role } = useAuth();
  const normalizedRole = role?.toLowerCase();

  if (status === "loading") {
    return null;
  }


  if (normalizedRole === "admin" || normalizedRole === "vendor_admin") {
    return <HomeforAdmin />;
  }

  if (normalizedRole === "driver") {
    return <ApprovalSuccessPage />;
  }




  return <AuthorizationForm />;
}