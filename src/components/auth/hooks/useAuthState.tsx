
import { useState } from "react";
import { useDevMode } from "./useDevMode";
import { useTestingMode } from "./useTestingMode";
import { useInitialAuthCheck } from "./utils/useInitialAuthCheck";
import { useAuthStateListener } from "./utils/useAuthStateListener";

export function useAuthState() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isDevelopmentMode } = useDevMode();
  const { testingMode } = useTestingMode();

  // Check initial authentication status
  useInitialAuthCheck({
    isDevelopmentMode,
    testingMode,
    setIsAuthenticated,
    setLoading
  });

  // Set up auth state change listener
  useAuthStateListener({
    isDevelopmentMode,
    testingMode,
    setIsAuthenticated
  });

  return { 
    isAuthenticated, 
    setIsAuthenticated, 
    loading, 
    setLoading
  };
}
