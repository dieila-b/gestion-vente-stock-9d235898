
import { useEffect, useState } from "react";
import { useAuthState } from "./hooks/useAuthState";
import { useAuthActions } from "./hooks/useAuthActions";
import { AuthContext } from "./context/AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setIsAuthenticated, loading, setLoading } = useAuthState();
  const { login, logout, isSubmitting } = useAuthActions(setIsAuthenticated, setLoading);
  const [testingMode, setTestingMode] = useState(false);

  // Détection du mode développement
  const isDevelopmentMode = import.meta.env.DEV;

  // Log initial auth state
  useEffect(() => {
    if (isDevelopmentMode) {
      console.log("AuthProvider initialized: Development mode - authentication bypass enabled");
    } else if (testingMode) {
      console.log("AuthProvider initialized: TESTING MODE - authentication bypass enabled in production");
    } else {
      console.log("AuthProvider initialized: Production mode - authentication required for all users");
    }
  }, [isDevelopmentMode, testingMode]);

  const enableTestingMode = () => {
    console.log("Enabling testing mode - authentication bypassed");
    setTestingMode(true);
    // Automatiquement définir comme authentifié en mode test
    setIsAuthenticated(true);
    setLoading(false);
    localStorage.setItem('auth_testing_mode', 'enabled');
  };

  const disableTestingMode = () => {
    console.log("Disabling testing mode - normal authentication restored");
    setTestingMode(false);
    // En désactivant le mode test, on déconnecte l'utilisateur sauf s'il a une session valide
    setIsAuthenticated(false);
    setLoading(true);
    localStorage.removeItem('auth_testing_mode');
    // Recharger l'état d'authentification après avoir désactivé le mode test
    setTimeout(() => setLoading(false), 500);
  };

  // Vérifier si le mode test était activé lors d'une session précédente
  useEffect(() => {
    const savedTestingMode = localStorage.getItem('auth_testing_mode');
    if (savedTestingMode === 'enabled') {
      console.log("Restoring testing mode from previous session");
      enableTestingMode();
    }
  }, []);

  const contextValue = {
    isAuthenticated,
    loading,
    login,
    logout,
    isSubmitting,
    isDevelopmentMode,
    testingMode,
    enableTestingMode,
    disableTestingMode
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
