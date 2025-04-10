
import { useEffect } from "react";
import { useAuthState } from "./useAuthState";
import { useAuthActions } from "./useAuthActions";
import { useDevMode } from "./useDevMode";
import { useTestingMode } from "./useTestingMode";

/**
 * Main hook for the AuthProvider component
 */
export function useAuthProvider() {
  const { isAuthenticated, setIsAuthenticated, loading, setLoading } = useAuthState();
  const { login, logout, isSubmitting } = useAuthActions(setIsAuthenticated, setLoading);
  const { isDevelopmentMode } = useDevMode();
  const { testingMode, enableTestingMode, disableTestingMode } = useTestingMode();

  // Log initial auth state
  useEffect(() => {
    if (isDevelopmentMode) {
      console.log("AuthProvider initialized: Development mode - authentication bypass enabled");
    } else if (testingMode) {
      console.log("AuthProvider initialized: TESTING MODE - authentication bypass enabled in production");
    } else {
      console.log("AuthProvider initialized: Production mode - authentication required for all users");
    }
    
    // Log current authentication state for debugging
    console.log("Current authentication state:", { 
      isAuthenticated, 
      loading, 
      isDevelopmentMode, 
      testingMode 
    });
  }, [isDevelopmentMode, testingMode, isAuthenticated, loading]);

  // Handle side effects when testing mode changes
  useEffect(() => {
    if (testingMode) {
      // Automatically authenticate in testing mode
      console.log("Testing mode activated: auto-authenticating user");
      setIsAuthenticated(true);
      setLoading(false);
    }
  }, [testingMode, setIsAuthenticated, setLoading]);

  return {
    // Auth state
    isAuthenticated,
    loading,
    
    // Auth actions
    login,
    logout,
    isSubmitting,
    
    // Environment mode
    isDevelopmentMode,
    
    // Testing mode
    testingMode,
    enableTestingMode,
    disableTestingMode
  };
}
