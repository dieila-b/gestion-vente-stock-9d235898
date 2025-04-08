
import { useEffect } from "react";
import { useAuthState } from "./hooks/useAuthState";
import { useAuthActions } from "./hooks/useAuthActions";
import { AuthContext } from "./context/AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setIsAuthenticated, loading, setLoading } = useAuthState();
  const { login, logout, isSubmitting } = useAuthActions(setIsAuthenticated, setLoading);

  // Détection du mode développement
  const isDevelopmentMode = import.meta.env.DEV;

  // Log initial auth state
  useEffect(() => {
    if (isDevelopmentMode) {
      console.log("AuthProvider initialized: Development mode - authentication bypass enabled");
    } else {
      console.log("AuthProvider initialized: Production mode - authentication required for all users");
    }
  }, [isDevelopmentMode]);

  const contextValue = {
    isAuthenticated,
    loading,
    login,
    logout,
    isSubmitting,
    isDevelopmentMode
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
