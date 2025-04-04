
import { useEffect } from "react";
import { useAuthState } from "./hooks/useAuthState";
import { useAuthActions } from "./hooks/useAuthActions";
import { AuthContext } from "./context/AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setIsAuthenticated, loading, setLoading, isDevelopmentMode } = useAuthState();
  const { login, logout, isSubmitting } = useAuthActions(setIsAuthenticated, setLoading);

  // Log initial auth state
  useEffect(() => {
    console.log("État d'authentification initial:", { isAuthenticated, loading, isDevelopmentMode });
    if (isDevelopmentMode) {
      console.log("Mode développeur: Authentification désactivée");
    }
  }, [isAuthenticated, loading, isDevelopmentMode]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout, isSubmitting, isDevelopmentMode }}>
      {children}
    </AuthContext.Provider>
  );
}
