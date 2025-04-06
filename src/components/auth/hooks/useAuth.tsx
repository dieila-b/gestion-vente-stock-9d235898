
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  // Check if in development mode
  const isDevelopmentMode = import.meta.env.DEV;
  
  console.log(isDevelopmentMode 
    ? "Auth hook: Development mode - authentication is completely disabled" 
    : "Auth hook: Production mode - checking real authentication status");
  
  // In development mode, always return authenticated
  // In production, return actual authentication status
  return {
    ...context,
    isAuthenticated: isDevelopmentMode ? true : context.isAuthenticated,
    loading: isDevelopmentMode ? false : context.loading,
    isSubmitting: isDevelopmentMode ? false : context.isSubmitting,
    isDevelopmentMode
  };
};
