
import { useEffect } from "react";
import { useAuthState } from "./hooks/useAuthState";
import { useAuthActions } from "./hooks/useAuthActions";
import { AuthContext } from "./context/AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setIsAuthenticated, loading, setLoading } = useAuthState();
  const { login, logout, isSubmitting } = useAuthActions(setIsAuthenticated, setLoading);

  // Log initial auth state
  useEffect(() => {
    console.log("État d'authentification initial:", { isAuthenticated, loading });
  }, [isAuthenticated, loading]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout, isSubmitting }}>
      {children}
    </AuthContext.Provider>
  );
}

export { useAuth } from "./hooks/useAuth";
