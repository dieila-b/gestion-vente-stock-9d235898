
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { toast } from "sonner";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading, isDevelopmentMode } = useAuth();

  useEffect(() => {
    console.log("RequireAuth effect running", { 
      isAuthenticated, 
      loading, 
      isDevelopmentMode,
      currentPath: location.pathname
    });
    
    // In development mode, always allow access and redirect from login page to dashboard
    if (isDevelopmentMode) {
      console.log("Development mode: authentication bypass enabled");
      if (location.pathname === "/login") {
        console.log("Development mode: Redirecting from login to dashboard");
        navigate("/dashboard", { replace: true });
      }
      return;
    }
    
    // In production mode, check if user is authenticated
    if (!isDevelopmentMode && !loading) {
      if (!isAuthenticated) {
        console.log("Production mode: User not authenticated, redirecting to login");
        toast.error("Veuillez vous connecter pour accéder à cette page");
        navigate("/login", { replace: true });
      } else {
        console.log("Production mode: User is authenticated, allowing access");
      }
    }
  }, [navigate, isAuthenticated, loading, isDevelopmentMode, location.pathname]);

  // Always grant access in development mode
  // In production, only grant access if authenticated or still loading
  if (!isDevelopmentMode && !isAuthenticated && !loading) {
    return null;
  }

  // If still loading in production mode, show a loading spinner
  if (!isDevelopmentMode && loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
