
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  console.log("Auth hook: Authentication is disabled - returning authenticated status");
  
  // Always return as authenticated with clear status
  return {
    ...context,
    isAuthenticated: true,
    loading: false,
    isSubmitting: false,
    isDevelopmentMode: true
  };
};
