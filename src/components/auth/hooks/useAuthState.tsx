
import { useState } from "react";
import { useDevMode } from "./useDevMode";
import { useTestingMode } from "./useTestingMode";
import { useInitialAuthCheck } from "./utils/useInitialAuthCheck";
import { useAuthStateListener } from "./utils/useAuthStateListener";

export function useAuthState() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isDevelopmentMode } = useDevMode();
  const { testingMode } = useTestingMode();

  console.log("Mode de test:", testingMode ? "Oui" : "Non");

  // Vérifier l'état d'authentification initial
  useInitialAuthCheck({
    isDevelopmentMode,
    testingMode,
    setIsAuthenticated,
    setLoading
  });

  // Configurer l'écouteur de changement d'état d'authentification
  useAuthStateListener({
    isDevelopmentMode,
    testingMode,
    setIsAuthenticated
  });

  return { 
    isAuthenticated, 
    setIsAuthenticated, 
    loading, 
    setLoading
  };
}
