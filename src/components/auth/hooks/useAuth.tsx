
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  // En mode développement, toujours considérer comme authentifié
  if (context.isDevelopmentMode) {
    return {
      ...context,
      isAuthenticated: true,
      loading: false,
    };
  }
  
  return context;
};
