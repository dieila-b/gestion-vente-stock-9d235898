
import { useEffect } from "react";
import { useAuthState } from "./hooks/useAuthState";
import { useAuthActions } from "./hooks/useAuthActions";
import { AuthContext } from "./context/AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isDevelopmentMode = import.meta.env.DEV;
  const { isAuthenticated, setIsAuthenticated, loading, setLoading, isDevelopmentMode: stateDevMode } = useAuthState();
  const { login, logout, isSubmitting } = useAuthActions(setIsAuthenticated, setLoading);

  // Log initial auth state
  useEffect(() => {
    console.log(
      isDevelopmentMode 
        ? "Authentication disabled: All users are automatically authenticated" 
        : "Production mode: Real authentication required"
    );
  }, [isDevelopmentMode]);

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
