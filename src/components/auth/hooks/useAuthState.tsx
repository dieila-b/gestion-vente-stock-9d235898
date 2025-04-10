
import { useState, useEffect } from "react";
import { useDevMode } from "./useDevMode";
import { useTestingMode } from "./useTestingMode";
import { useInitialAuthCheck } from "./utils/useInitialAuthCheck";
import { useAuthStateListener } from "./utils/useAuthStateListener";
import { supabase } from "@/integrations/supabase/client";

export function useAuthState() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isDevelopmentMode } = useDevMode();
  const { testingMode } = useTestingMode();

  console.log("Mode de test:", testingMode ? "Oui" : "Non");
  console.log("Mode de développement:", isDevelopmentMode ? "Oui" : "Non");
  console.log("État d'authentification actuel:", isAuthenticated ? "Authentifié" : "Non authentifié");

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

  // Vérifier l'état d'authentification initial
  useInitialAuthCheck({
    isDevelopmentMode,
    testingMode,
    setIsAuthenticated,
    setLoading
  });

  // Configurer l'écouteur de changement d'état d'authentification
  useAuthStateListener({
    isDevelopmentMode,
    testingMode,
    setIsAuthenticated
  });

  // Log d'état pour déboggage
  useEffect(() => {
    console.log("État d'authentification mis à jour:", { 
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
