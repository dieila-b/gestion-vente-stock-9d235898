
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
    }
    
    // Ensure demo users in localStorage
    if (isDevelopmentMode) {
      try {
        const storedUsers = localStorage.getItem('internalUsers');
        if (!storedUsers) {
          const demoUsers = [
            {
              id: "dev-1743844624581",
              first_name: "Dieila",
              last_name: "Barry",
              email: "wosyrab@gmail.com",
              phone: "623268781",
              address: "Matam",
              role: "admin",
              is_active: true,
              photo_url: null
            },
            {
              id: "dev-1743853323494",
              first_name: "Dieila",
              last_name: "Barry",
              email: "wosyrab@yahoo.fr",
              phone: "623268781",
              address: "Madina",
              role: "manager",
              is_active: true,
              photo_url: null
            }
          ];
          localStorage.setItem('internalUsers', JSON.stringify(demoUsers));
          console.log("Utilisateurs de démo créés lors de l'initialisation de l'AuthProvider");
        }
      } catch (err) {
        console.error("Erreur lors de la création des utilisateurs de démo:", err);
      }
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
