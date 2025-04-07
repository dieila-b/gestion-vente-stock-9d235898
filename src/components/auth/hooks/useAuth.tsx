
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  // Check if in development mode (for informational purposes only)
  const isDevelopmentMode = import.meta.env.DEV;
  
  console.log("Auth hook: Authentication required, checking real authentication status");
  
  return context;
};
