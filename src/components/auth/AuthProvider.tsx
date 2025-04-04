
import { useEffect } from "react";
import { useAuthState } from "./hooks/useAuthState";
import { useAuthActions } from "./hooks/useAuthActions";
import { AuthContext } from "./context/AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setIsAuthenticated, loading, setLoading } = useAuthState();
  const { login, logout } = useAuthActions(setIsAuthenticated, setLoading);

  // Log initial auth state
  useEffect(() => {
    console.log("État d'authentification initial:", { isAuthenticated, loading });
  }, [isAuthenticated, loading]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export { useAuth } from "./hooks/useAuth";
