
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
