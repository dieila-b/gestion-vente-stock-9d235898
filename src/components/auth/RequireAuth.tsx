
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { isAuthenticated, loading, isDevelopmentMode } = useAuth();

  useEffect(() => {
    console.log(isDevelopmentMode 
      ? "RequireAuth: Development mode - authentication bypass enabled" 
      : "RequireAuth: Production mode - checking authentication");
    
    // In development mode, always redirect from login page to dashboard
    if (isDevelopmentMode && window.location.pathname === "/login") {
      console.log("Development mode: Redirecting from login to dashboard");
      navigate("/dashboard", { replace: true });
      return;
    }
    
    // In production mode, check if user is authenticated
    if (!isDevelopmentMode && !loading && !isAuthenticated) {
      console.log("Production mode: User not authenticated, redirecting to login");
      navigate("/login", { replace: true });
    }
  }, [navigate, isAuthenticated, loading, isDevelopmentMode]);

  // Always grant access in development mode
  // In production, only grant access if authenticated
  if (!isDevelopmentMode && !isAuthenticated && !loading) {
    return null;
  }

  return <>{children}</>;
}
