
import { useState } from "react";
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
      
      // In development mode or testing mode, auto-authenticate
      if (isDevelopmentMode || testingMode) {
        console.log(isDevelopmentMode 
          ? "Development mode: Auto-authenticating without credentials check" 
          : "Testing mode: Auto-authenticating without credentials check");
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
      if (isDevelopmentMode || testingMode) {
        console.log(isDevelopmentMode 
          ? "Development mode: Simple logout without server calls" 
          : "Testing mode: Simple logout without server calls");
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
