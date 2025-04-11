
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

const TESTING_MODE_KEY = 'auth_testing_mode';

/**
 * Hook pour gérer le mode de test d'authentification
 */
export function useTestingMode() {
  const [testingMode, setTestingMode] = useState(false);

  // Vérifie si le mode test était précédemment activé
  useEffect(() => {
    const savedTestingMode = localStorage.getItem(TESTING_MODE_KEY);
    if (savedTestingMode === 'enabled') {
      console.log("[Auth] Restauration du mode test depuis la session précédente");
      setTestingMode(true);
      toast.info("Mode test restauré - Authentification contournée", {
        id: "restore-testing-mode",
        duration: 3000
      });
    }
  }, []);

  // Active le mode test
  const enableTestingMode = useCallback(() => {
    console.log("[Auth] Activation du mode test - authentification contournée");
    setTestingMode(true);
    localStorage.setItem(TESTING_MODE_KEY, 'enabled');
    toast.success("Mode test activé - Authentification contournée", {
      id: "enable-testing-mode",
      duration: 3000
    });
  }, []);

  // Désactive le mode test
  const disableTestingMode = useCallback(() => {
    console.log("[Auth] Désactivation du mode test - authentification standard restaurée");
    setTestingMode(false);
    localStorage.removeItem(TESTING_MODE_KEY);
    toast.info("Mode test désactivé - Authentification standard restaurée", {
      id: "disable-testing-mode",
      duration: 3000
    });
  }, []);

  return {
    testingMode,
    enableTestingMode,
    disableTestingMode
  };
}
