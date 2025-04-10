
import { useMemo } from "react";

/**
 * Hook to detect if the application is running in development mode
 */
export function useDevMode() {
  const isDevelopmentMode = useMemo(() => import.meta.env.DEV, []);
  
  return { isDevelopmentMode };
}
