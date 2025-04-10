
import { useAuth } from "./hooks/useAuth";
import { useLocation, Navigate } from "react-router-dom";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, isDevelopmentMode } = useAuth();
  const location = useLocation();

  console.log("RequireAuth: Checking authentication status", { isDevelopmentMode, isAuthenticated, loading });

  if (loading) {
    console.log("RequireAuth: Authentication check in progress...");
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  if (!isAuthenticated) {
    console.log("RequireAuth: No active session, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Enhanced development mode message
  if (isDevelopmentMode) {
    console.log("RequireAuth: Development mode active - Authentication bypassed automatically");
  } else {
    console.log("RequireAuth: Production mode - Valid user session verified");
  }
  
  return <>{children}</>;
}
