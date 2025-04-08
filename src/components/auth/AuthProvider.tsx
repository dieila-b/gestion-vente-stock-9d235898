
import { useEffect } from "react";
import { useAuthState } from "./hooks/useAuthState";
import { useAuthActions } from "./hooks/useAuthActions";
import { AuthContext } from "./context/AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isDevelopmentMode = import.meta.env.DEV;
  const { isAuthenticated, setIsAuthenticated, loading, setLoading } = useAuthState();
  const { login, logout, isSubmitting } = useAuthActions(setIsAuthenticated, setLoading);

  // Log initial auth state
  useEffect(() => {
    if (isDevelopmentMode) {
      console.log("Développement: authentification automatique");
    } else {
      console.log("Production: authentification requise pour tous les utilisateurs");
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
