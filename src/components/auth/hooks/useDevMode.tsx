
import { useMemo } from "react";

/**
 * Hook to detect if the application is running in development mode
 */
export function useDevMode() {
  const isDevelopmentMode = useMemo(() => {
    const isDev = import.meta.env.DEV;
    console.log("Mode de développement détecté:", isDev);
    return isDev;
  }, []);
  
  return { isDevelopmentMode };
}
