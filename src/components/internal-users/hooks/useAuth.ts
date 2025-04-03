
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth as useGlobalAuth } from "@/components/auth/AuthProvider";

export const useAuth = () => {
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { isAuthenticated } = useGlobalAuth();

  useEffect(() => {
    const checkAuth = async () => {
      setIsAuthChecking(true);
      try {
        // Pour le développement - considérer automatiquement autorisé
        if (process.env.NODE_ENV === 'development') {
          console.log("Mode développement: Authentification désactivée - Utilisateur automatiquement autorisé");
          setIsAuthorized(true);
          setIsAuthChecking(false);
          return;
        }

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
    
    checkAuth();
  }, [isAuthenticated]);

  return {
    isAuthChecking,
    isAuthorized
  };
};
