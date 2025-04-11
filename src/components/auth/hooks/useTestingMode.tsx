
import { useState, useEffect } from "react";

export function useTestingMode() {
  const [testingMode, setTestingMode] = useState<boolean>(false);

  // Charger l'état du mode test depuis localStorage au démarrage
  useEffect(() => {
    const savedMode = localStorage.getItem('auth_testing_mode');
    if (savedMode === 'enabled') {
      console.log("Mode test chargé depuis localStorage: activé");
      setTestingMode(true);
    } else {
      console.log("Mode test chargé depuis localStorage: désactivé ou non défini");
    }
  }, []);

  // Activer le mode test
  const enableTestingMode = () => {
    console.log("Activation du mode test");
    localStorage.setItem('auth_testing_mode', 'enabled');
    setTestingMode(true);
  };

  // Désactiver le mode test
  const disableTestingMode = () => {
    console.log("Désactivation du mode test");
    localStorage.removeItem('auth_testing_mode');
    setTestingMode(false);
  };

  return { testingMode, enableTestingMode, disableTestingMode };
}
