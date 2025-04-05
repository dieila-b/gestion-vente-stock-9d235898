
import { useEffect } from "react";
import { useAuthState } from "./hooks/useAuthState";
import { useAuthActions } from "./hooks/useAuthActions";
import { AuthContext } from "./context/AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setIsAuthenticated, loading, setLoading, isDevelopmentMode } = useAuthState();
  const { login, logout, isSubmitting } = useAuthActions(setIsAuthenticated, setLoading);

  // Log initial auth state
  useEffect(() => {
    console.log("État d'authentification initial:", { 
      isAuthenticated: isDevelopmentMode ? true : isAuthenticated, 
      loading: isDevelopmentMode ? false : loading, 
      isDevelopmentMode 
    });
    
    if (isDevelopmentMode) {
      console.log("Mode développeur: Authentification désactivée");
    }
  }, [isAuthenticated, loading, isDevelopmentMode]);

  // Force isAuthenticated to true in development mode
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
