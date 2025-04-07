import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { toast } from "sonner";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  console.log("🔍 Auth Check | MODE:", import.meta.env.MODE);

  // 🔓 Bypass authentication when in development mode
  if (import.meta.env.MODE === "development") {
    console.log("🔓 Bypassing authentication in development mode");
    return <>{children}</>;
  }

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        if (location.pathname !== "/login" && location.pathname !== "/unauthorized") {
          toast.error("Veuillez vous connecter pour accéder à cette page");
          navigate("/login", { replace: true, state: { from: location.pathname } });
        }
      }
    }
  }, [navigate, isAuthenticated, loading, location.pathname]);

  if (!isAuthenticated && !loading) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
