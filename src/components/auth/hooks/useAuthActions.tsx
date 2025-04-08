
import { useState } from "react";
import { handleProdModeLogin } from "./utils/prodModeAuth";
import { handleDevModeLogin } from "./utils/devModeAuth";
import { handleLogout } from "./utils/logoutHandler";

export function useAuthActions(
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDevelopmentMode = import.meta.env.DEV;
  
  const login = async (email: string, password: string) => {
    console.log("Login attempt with email:", email);
    
    try {
      setIsSubmitting(true);
      
      // En mode développement, vérifier les identifiants dans localStorage
      if (isDevelopmentMode) {
        console.log("Development mode: Checking credentials");
        const result = handleDevModeLogin(email);
        
        if (result.success) {
          setIsAuthenticated(true);
        }
        
        return result;
      }
      
      // En mode production, vérifier avec Supabase
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
      await handleLogout(isDevelopmentMode);
      setIsAuthenticated(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { login, logout, isSubmitting };
}
