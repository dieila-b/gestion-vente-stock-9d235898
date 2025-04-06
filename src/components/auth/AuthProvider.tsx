
import { useEffect } from "react";
import { useAuthState } from "./hooks/useAuthState";
import { useAuthActions } from "./hooks/useAuthActions";
import { AuthContext } from "./context/AuthContext";
import { createDemoUsers } from "./hooks/utils/createDemoUsers";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isDevelopmentMode = import.meta.env.DEV;
  const { isAuthenticated, setIsAuthenticated, loading, setLoading } = useAuthState();
  const { login, logout, isSubmitting } = useAuthActions(setIsAuthenticated, setLoading);

  // Log initial auth state
  useEffect(() => {
    console.log(
      isDevelopmentMode 
        ? "Authentication COMPLETELY DISABLED: Development mode - all users are automatically authenticated" 
        : "Production mode: Real authentication required for internal users"
    );
    
    // In development mode, force authentication to be true
    if (isDevelopmentMode) {
      console.log("Setting authenticated state to true (development mode)");
      setIsAuthenticated(true);
      setLoading(false);
      
      // Ensure demo users in localStorage
      createDemoUsers();
    }
  }, [isDevelopmentMode, setIsAuthenticated, setLoading]);

  // In development mode, force authentication to be true
  // In production, use actual authentication status
  const contextValue = {
    isAuthenticated: isDevelopmentMode ? true : isAuthenticated,
    loading: isDevelopmentMode ? false : loading,
    login,
    logout,
    isSubmitting: isDevelopmentMode ? false : isSubmitting,
    isDevelopmentMode
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
