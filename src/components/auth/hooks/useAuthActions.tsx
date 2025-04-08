
import { useState } from "react";
import { handleProdModeLogin } from "./utils/prodModeAuth";
import { handleLogout } from "./utils/logoutHandler";

export function useAuthActions(
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = async (email: string, password: string) => {
    console.log("Login attempt with email:", email);
    
    try {
      setIsSubmitting(true);
      
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
      await handleLogout(false);
      setIsAuthenticated(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { login, logout, isSubmitting };
}
