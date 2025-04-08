
import { useSession } from "@lib/auth";
import { useLocation, Navigate } from "react-router-dom";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const location = useLocation();

  console.log("RequireAuth: Checking authentication status");

  if (!session) {
    console.log("RequireAuth: No active session, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log("RequireAuth: Valid session found, rendering children");
  return children;
}
