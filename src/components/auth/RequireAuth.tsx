
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
    
    // In development mode, always allow access without any checks
    if (isDevelopmentMode) {
      console.log("Development mode: authentication completely disabled - all routes accessible");
      return;
    }
    
    // In production mode, check if user is authenticated
    if (!isDevelopmentMode && !loading) {
      if (!isAuthenticated) {
        console.log("Production mode: User not authenticated, redirecting to login");
        if (location.pathname !== "/login") {
          toast.error("Veuillez vous connecter pour accéder à cette page");
          navigate("/login", { replace: true, state: { from: location.pathname } });
        }
      } else {
        console.log("Production mode: User is authenticated, allowing access");
      }
    }
  }, [navigate, isAuthenticated, loading, isDevelopmentMode, location.pathname]);

  // Always grant access in development mode
  if (isDevelopmentMode) {
    return <>{children}</>;
  }

  // In production mode, only grant access if authenticated or still loading
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
