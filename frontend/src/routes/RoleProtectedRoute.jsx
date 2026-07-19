import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import BrandLoading from "../components/loading/BrandLoading";

export default function RoleProtectedRoute({
  allowedRoles,
  children
}) {

  const user = useAuthStore(
    (s) => s.user
  );

  const authLoading = useAuthStore(
    (s) => s.authLoading
  );

  if (authLoading) {
    return <BrandLoading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;

}