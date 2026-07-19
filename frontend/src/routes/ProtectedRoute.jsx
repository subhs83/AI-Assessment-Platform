import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import BrandLoading from "../components/loading/BrandLoading";

export default function ProtectedRoute({ children }) {

  const isAuthenticated = useAuthStore(
    (s) => s.isAuthenticated
  );

  const authLoading = useAuthStore(
    (s) => s.authLoading
  );

  if (authLoading) {
    return <BrandLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;

}