
import { useState } from "react";
import { handleProdModeLogin } from "./utils/prodModeAuth";
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
      
      // In development mode, auto-authenticate without checking credentials
      if (isDevelopmentMode) {
        console.log("Development mode: Auto-authenticating without credentials check");
        setIsAuthenticated(true);
        return { success: true };
      }
      
      // In production mode, use the regular authentication flow
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
      
      // In development mode, just set authentication state to false
      if (isDevelopmentMode) {
        console.log("Development mode: Simple logout without server calls");
        setIsAuthenticated(false);
        return;
      }
      
      // In production mode, use the regular logout flow
      await handleLogout(isDevelopmentMode);
      setIsAuthenticated(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { login, logout, isSubmitting };
}
