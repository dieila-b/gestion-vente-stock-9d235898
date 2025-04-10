
import { useState } from "react";
import { handleDevModeLogin } from "./utils/devModeAuth";
import { handleProdModeLogin } from "./utils/prodModeAuth";
import { handleLogout } from "./utils/logoutHandler";
import { useDevMode } from "./useDevMode";
import { useTestingMode } from "./useTestingMode";

export function useAuthActions(
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isDevelopmentMode } = useDevMode();
  const { testingMode } = useTestingMode();
  
  const login = async (email: string, password: string) => {
    console.log("Login attempt with email:", email);
    
    try {
      setIsSubmitting(true);
      
      // En mode développement ou testing, auto-authentification
      if (isDevelopmentMode || testingMode) {
        console.log(isDevelopmentMode 
          ? "Development mode: Auto-authenticating without credentials check" 
          : "Testing mode: Auto-authenticating without credentials check");
        setIsAuthenticated(true);
        return { success: true };
      }
      
      // En mode production, utiliser le flux d'authentification normal
      const result = await handleProdModeLogin(email, password);
      
      if (result.success) {
        setIsAuthenticated(true);
      }
      
      return result;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const logout = async () => {
    try {
      setIsSubmitting(true);
      
      // En mode développement ou testing, simplement mettre l'état d'authentification à false
      if (isDevelopmentMode || testingMode) {
        console.log(isDevelopmentMode 
          ? "Development mode: Simple logout without server calls" 
          : "Testing mode: Simple logout without server calls");
        setIsAuthenticated(false);
        return;
      }
      
      // En mode production, utiliser le flux de déconnexion normal
      await handleLogout(isDevelopmentMode);
      setIsAuthenticated(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { login, logout, isSubmitting };
}
