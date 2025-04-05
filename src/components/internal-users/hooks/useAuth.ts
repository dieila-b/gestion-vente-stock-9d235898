import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth as useGlobalAuth } from "@/components/auth/hooks/useAuth";

export const useAuth = () => {
  const [isAuthChecking, setIsAuthChecking] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { isAuthenticated, isDevelopmentMode } = useGlobalAuth();

  useEffect(() => {
    // En mode développement, donner toutes les autorisations immédiatement
    if (isDevelopmentMode) {
      console.log("Mode développeur: Autorisation complète accordée automatiquement");
      setIsAuthorized(true);
      setIsAuthChecking(false);
      return;
    }

    const checkAuth = async () => {
      setIsAuthChecking(true);
      try {
        // Obtenir la session courante
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("Pas de session trouvée, utilisateur non autorisé");
          setIsAuthorized(false);
          setIsAuthChecking(false);
          return;
        }
        
        // Vérifier si l'utilisateur a un rôle d'admin ou de manager
        const { data: userData, error: userError } = await supabase
          .from('internal_users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (userError) {
          console.error("Erreur lors de la vérification du rôle:", userError);
          setIsAuthorized(false);
        } else if (userData) {
          // Permettre aux admins ET aux managers d'accéder à la page
          const hasPermission = ['admin', 'manager'].includes(userData.role);
          console.log(`Rôle utilisateur: ${userData.role}, a la permission: ${hasPermission}`);
          setIsAuthorized(hasPermission);
        } else {
          console.log("Aucune donnée utilisateur trouvée");
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error("Erreur de vérification d'authentification:", error);
        setIsAuthorized(false);
      } finally {
        setIsAuthChecking(false);
      }
    };
    
    // N'exécuter la vérification d'authentification qu'en production
    if (!isDevelopmentMode && isAuthenticated) {
      checkAuth();
    }
  }, [isAuthenticated, isDevelopmentMode]);

  return {
    isAuthChecking: isDevelopmentMode ? false : isAuthChecking,
    isAuthorized: isDevelopmentMode ? true : isAuthorized
  };
};
