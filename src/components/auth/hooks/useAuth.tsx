
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  // Check if we're in development mode
  if (import.meta.env.MODE === "development") {
    console.log("Auth hook: Development mode detected, bypassing auth");
    // Return that we're already authenticated in development mode
    return {
      ...context,
      isAuthenticated: true,
      loading: false
    };
  }
  
  console.log("Auth hook: Authentication required, checking real authentication status");
  
  return context;
};
