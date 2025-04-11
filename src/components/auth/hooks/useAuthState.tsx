
import { useState, useEffect } from "react";
import { useDevMode } from "./useDevMode";
import { useTestingMode } from "./useTestingMode";
import { useInitialAuthCheck } from "./utils/useInitialAuthCheck";
import { useAuthStateListener } from "./utils/useAuthStateListener";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useAuthState() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isDevelopmentMode } = useDevMode();
  const { testingMode } = useTestingMode();

  console.log("[Auth] Mode de test:", testingMode ? "Activé" : "Désactivé");
  console.log("[Auth] Mode de développement:", isDevelopmentMode ? "Activé" : "Désactivé");
  console.log("[Auth] État d'authentification actuel:", isAuthenticated ? "Authentifié" : "Non authentifié");

  // Bypass automatique en mode développement ou test
  useEffect(() => {
    if (isDevelopmentMode || testingMode) {
      console.log(`[Auth] Bypass d'authentification en mode ${isDevelopmentMode ? 'développement' : 'test'}`);
      setIsAuthenticated(true);
      setLoading(false);
      
      // Notification visuelle du bypass
      const modeLabel = isDevelopmentMode ? "développement" : "test";
      toast.success(`Mode ${modeLabel} actif - Authentification contournée`, {
        id: "auth-bypass-toast",
        duration: 4000
      });
    }
  }, [isDevelopmentMode, testingMode]);

  // Vérifier tous les utilisateurs internes au démarrage (pour débogage)
  useEffect(() => {
    const fetchAllInternalUsers = async () => {
      if (isDevelopmentMode || testingMode) return;
      
      try {
        const { data, error } = await supabase
          .from('internal_users')
          .select('id, email, is_active');
          
        if (error) {
          console.error("Erreur lors de la récupération des utilisateurs internes:", error);
          return;
        }
        
        console.log("Tous les utilisateurs internes trouvés:", data);
        
        // Vérifier spécifiquement pour wosyrab@yahoo.fr
        const testUser = data?.find(user => 
          user.email.toLowerCase().includes("wosyrab@yahoo.fr")
        );
        
        if (testUser) {
          console.log("Utilisateur de test trouvé:", testUser);
        } else {
          console.error("ATTENTION: L'utilisateur de test wosyrab@yahoo.fr n'a pas été trouvé dans internal_users");
        }
        
      } catch (error) {
        console.error("Erreur lors de la vérification des utilisateurs internes:", error);
      }
    };
    
    fetchAllInternalUsers();
  }, [isDevelopmentMode, testingMode]);

  // Vérifier l'état d'authentification initial (seulement pour le mode production standard)
  useEffect(() => {
    if (!isDevelopmentMode && !testingMode) {
      console.log("[Auth] Vérification de l'authentification standard (mode production)");
      
      // Vérifier l'état d'authentification initial en mode production
      const checkInitialAuth = async () => {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData.session) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
          setLoading(false);
        } catch (error) {
          console.error("Erreur lors de la vérification de la session:", error);
          setIsAuthenticated(false);
          setLoading(false);
        }
      };
      
      checkInitialAuth();
      
      // Configurer l'écouteur de changement d'état d'authentification
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setIsAuthenticated(!!session);
        }
      );
      
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isDevelopmentMode, testingMode]);

  // Log d'état pour déboggage
  useEffect(() => {
    console.log("[Auth] État d'authentification mis à jour:", { 
      isAuthenticated, 
      loading, 
      isDevelopmentMode, 
      testingMode 
    });
  }, [isAuthenticated, loading, isDevelopmentMode, testingMode]);

  return { 
    isAuthenticated, 
    setIsAuthenticated, 
    loading, 
    setLoading
  };
}
