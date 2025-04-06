
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  // Always use production mode authentication
  console.log("Auth hook: Production mode - checking real authentication status");
  
  return {
    ...context,
    isAuthenticated: context.isAuthenticated,
    loading: context.loading,
    isSubmitting: context.isSubmitting,
    isDevelopmentMode: false
  };
};
