
import { useEffect } from "react";
import { useAuthState } from "./hooks/useAuthState";
import { useAuthActions } from "./hooks/useAuthActions";
import { AuthContext } from "./context/AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setIsAuthenticated, loading, setLoading, isDevelopmentMode } = useAuthState();
  const { login, logout, isSubmitting } = useAuthActions(setIsAuthenticated, setLoading);

  // Log initial auth state
  useEffect(() => {
    console.log("Authentification désactivée: Tous les utilisateurs sont authentifiés automatiquement");
  }, []);

  // Force authentication to be true always
  const contextValue = {
    isAuthenticated: true,
    loading: false,
    login,
    logout,
    isSubmitting: false,
    isDevelopmentMode: true
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
