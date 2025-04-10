
import { useState, useEffect } from "react";
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
  console.log("Mode de développement:", isDevelopmentMode ? "Oui" : "Non");
  console.log("État d'authentification actuel:", isAuthenticated ? "Authentifié" : "Non authentifié");

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

  // Log d'état pour déboggage
  useEffect(() => {
    console.log("État d'authentification mis à jour:", { 
      isAuthenticated, 
      loading, 
      isDevelopmentMode, 
      testingMode 
    });
  }, [isAuthenticated, loading, isDevelopmentMode, testingMode]);

  return { 
    isAuthenticated, 
    setIsAuthenticated, 
    loading, 
    setLoading
  };
}
