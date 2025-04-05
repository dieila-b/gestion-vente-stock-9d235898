
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  // Always return as authenticated
  return {
    ...context,
    isAuthenticated: true,
    loading: false,
    isSubmitting: false,
    isDevelopmentMode: true
  };
};
