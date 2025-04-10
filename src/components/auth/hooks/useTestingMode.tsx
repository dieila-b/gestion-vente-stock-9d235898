
import { useState, useEffect, useCallback } from "react";

/**
 * Hook to manage testing mode state
 */
export function useTestingMode() {
  const [testingMode, setTestingMode] = useState(false);

  // Check if testing mode was previously enabled
  useEffect(() => {
    const savedTestingMode = localStorage.getItem('auth_testing_mode');
    if (savedTestingMode === 'enabled') {
      console.log("Restoring testing mode from previous session");
      setTestingMode(true);
    }
  }, []);

  // Enable testing mode
  const enableTestingMode = useCallback(() => {
    console.log("Enabling testing mode - authentication bypassed");
    setTestingMode(true);
    localStorage.setItem('auth_testing_mode', 'enabled');
  }, []);

  // Disable testing mode
  const disableTestingMode = useCallback(() => {
    console.log("Disabling testing mode - normal authentication restored");
    setTestingMode(false);
    localStorage.removeItem('auth_testing_mode');
  }, []);

  return {
    testingMode,
    enableTestingMode,
    disableTestingMode
  };
}
