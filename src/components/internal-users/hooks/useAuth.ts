
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth as useGlobalAuth } from "@/components/auth/hooks/useAuth";

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
          console.log("Mode développement: Utilisateur considéré comme autorisé");
          setIsAuthorized(true);
          setIsAuthChecking(false);
          return;
        }

        // Récupérer le rôle de l'utilisateur du localStorage
        const userRole = localStorage.getItem('userRole');
        console.log("Rôle utilisateur depuis localStorage:", userRole);
        
        // Vérifier les autorisations basées sur le rôle
        if (userRole && ['admin', 'manager'].includes(userRole)) {
          console.log("Utilisateur autorisé basé sur le rôle:", userRole);
          setIsAuthorized(true);
        } else {
          console.log("Utilisateur non autorisé. Rôle:", userRole);
          setIsAuthorized(false);
          
          // Double vérification dans la base de données si nécessaire
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            const { data: userData, error: userError } = await supabase
              .from('internal_users')
              .select('role')
              .eq('email', session.user.email)
              .single();
            
            if (userError) {
              console.error("Erreur lors de la vérification du rôle:", userError);
            } else if (userData && ['admin', 'manager'].includes(userData.role)) {
              console.log("Rôle vérifié dans la base de données:", userData.role);
              setIsAuthorized(true);
              localStorage.setItem('userRole', userData.role);
            }
          }
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
