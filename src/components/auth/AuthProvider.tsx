
import { useEffect } from "react";
import { useAuthState } from "./hooks/useAuthState";
import { useAuthActions } from "./hooks/useAuthActions";
import { AuthContext } from "./context/AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setIsAuthenticated, loading, setLoading, userRole, setUserRole } = useAuthState();
  const { login, logout, isSubmitting } = useAuthActions(setIsAuthenticated, setLoading, setUserRole);

  // Log initial auth state
  useEffect(() => {
    console.log("État d'authentification initial:", { isAuthenticated, loading, userRole });
  }, [isAuthenticated, loading, userRole]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout, isSubmitting, userRole }}>
      {children}
    </AuthContext.Provider>
  );
}

// Ne pas exporter useAuth ici pour éviter des dépendances circulaires
