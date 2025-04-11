
import { useMemo, useEffect } from "react";
import { toast } from "sonner";

/**
 * Hook pour détecter si l'application fonctionne en mode développement
 */
export function useDevMode() {
  const isDevelopmentMode = useMemo(() => {
    const isDev = import.meta.env.DEV;
    console.log("[Auth] Mode de développement détecté:", isDev);
    return isDev;
  }, []);
  
  // Notification du mode dev au démarrage
  useEffect(() => {
    if (isDevelopmentMode) {
      toast.info("Mode développement actif - Authentification automatique", {
        id: "dev-mode-active",
        duration: 4000
      });
    }
  }, [isDevelopmentMode]);
  
  return { isDevelopmentMode };
}
