
import { useState, useEffect } from "react";
import { useAuth as useGlobalAuth } from "@/components/auth/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const { isAuthenticated, loading } = useGlobalAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!isAuthenticated || loading) {
        setIsAuthorized(false);
        setIsAuthChecking(loading);
        return;
      }

      try {
        // Vérifier le rôle dans localStorage en premier
        const userRole = localStorage.getItem('userRole');
        
        if (userRole === 'admin') {
          console.log("Accès autorisé: rôle admin trouvé dans localStorage");
          setIsAuthorized(true);
          setIsAuthChecking(false);
          return;
        }
        
        // Vérifier dans Supabase si le rôle n'est pas admin en localStorage
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("Accès refusé: pas de session active");
          setIsAuthorized(false);
          setIsAuthChecking(false);
          return;
        }
        
        const { data: user, error } = await supabase
          .from('internal_users')
          .select('role')
          .eq('email', session.user.email)
          .eq('is_active', true)
          .single();
          
        if (error || !user) {
          console.log("Accès refusé: utilisateur non trouvé ou inactif");
          setIsAuthorized(false);
        } else if (user.role === 'admin') {
          console.log("Accès autorisé: rôle admin confirmé dans la base de données");
          setIsAuthorized(true);
          // Mettre à jour localStorage pour éviter de refaire la requête
          localStorage.setItem('userRole', 'admin');
        } else {
          console.log("Accès refusé: l'utilisateur n'est pas admin");
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des autorisations:", error);
        setIsAuthorized(false);
      } finally {
        setIsAuthChecking(false);
      }
    };
    
    checkAdminAccess();
  }, [isAuthenticated, loading]);

  return { isAuthorized, isAuthChecking };
};
