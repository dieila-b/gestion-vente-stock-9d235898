
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { toast } from "sonner";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    console.log("RequireAuth effect running", { 
      isAuthenticated, 
      loading,
      currentPath: location.pathname
    });
    
    // Always check authentication regardless of mode
    if (!loading) {
      if (!isAuthenticated) {
        console.log("User not authenticated, redirecting to login");
        if (location.pathname !== "/login" && location.pathname !== "/unauthorized") {
          toast.error("Veuillez vous connecter pour accéder à cette page");
          navigate("/login", { replace: true, state: { from: location.pathname } });
        }
      } else {
        console.log("User is authenticated, allowing access");
      }
    }
  }, [navigate, isAuthenticated, loading, location.pathname]);

  // Only grant access if authenticated or still loading
  if (!isAuthenticated && !loading) {
    return null;
  }

  // If still loading, show a loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
