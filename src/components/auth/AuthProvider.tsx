
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
        ? "Authentication disabled: Development mode - all users are automatically authenticated" 
        : "Production mode: Real authentication required for internal users"
    );
    
    // Assurons-nous que localStorage a les utilisateurs de démo
    if (isDevelopmentMode) {
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
    }
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
