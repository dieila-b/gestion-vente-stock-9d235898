
import { useState, useEffect } from "react";

export function useAuthState() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loading, setLoading] = useState(false);
  const isDevelopmentMode = true;

  useEffect(() => {
    console.log("Authentication disabled: All users are automatically authenticated");
    setIsAuthenticated(true);
    setLoading(false);
  }, []);

  return { 
    isAuthenticated: true, 
    setIsAuthenticated, 
    loading: false, 
    setLoading, 
    isDevelopmentMode: true
  };
}
