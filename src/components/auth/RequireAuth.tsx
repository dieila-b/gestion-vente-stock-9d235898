import { useSession } from "@lib/auth";
import { useLocation, Navigate } from "react-router-dom";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const location = useLocation();

  const isDev = import.meta.env.MODE === "development";
  console.log("Environment =", import.meta.env.MODE);

  if (isDev) {
    console.log("Bypassing auth in development mode.");
    return children;
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
