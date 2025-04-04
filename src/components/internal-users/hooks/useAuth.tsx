
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth as useGlobalAuth } from "@/components/auth/hooks/useAuth";
import { toast } from "sonner";

export const useAuth = () => {
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { isAuthenticated } = useGlobalAuth();

  useEffect(() => {
    const checkAuth = async () => {
      setIsAuthChecking(true);
      
      try {
        // En mode développement - automatiquement autorisé
        if (process.env.NODE_ENV === 'development') {
          console.log("Mode développement: Utilisateur considéré comme autorisé");
          setIsAuthorized(true);
          setIsAuthChecking(false);
          return;
        }

        if (!isAuthenticated) {
          console.log("Utilisateur non authentifié");
          setIsAuthorized(false);
          setIsAuthChecking(false);
          return;
        }

        // Vérifier d'abord le rôle dans localStorage
        const userRole = localStorage.getItem('userRole');
        console.log("Rôle utilisateur depuis localStorage:", userRole);
        
        if (userRole && ['admin', 'manager'].includes(userRole)) {
          console.log("Utilisateur autorisé basé sur le rôle:", userRole);
          setIsAuthorized(true);
          setIsAuthChecking(false);
          return;
        } 
        
        console.log("Vérification supplémentaire du rôle en base de données");
        // Vérification dans la base de données
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("Session trouvée, vérification du rôle pour:", session.user.email);
          const { data: userData, error: userError } = await supabase
            .from('internal_users')
            .select('role, is_active')
            .eq('email', session.user.email)
            .single();
          
          if (userError) {
            console.error("Erreur lors de la vérification du rôle:", userError);
            toast.error("Erreur lors de la vérification des autorisations");
            setIsAuthorized(false);
          } else if (userData && ['admin', 'manager'].includes(userData.role) && userData.is_active) {
            console.log("Rôle vérifié dans la base de données:", userData.role, "Actif:", userData.is_active);
            setIsAuthorized(true);
            localStorage.setItem('userRole', userData.role);
          } else {
            console.log("Utilisateur non autorisé ou rôle non valide:", userData);
            toast.error("Vous n'avez pas les autorisations nécessaires");
            setIsAuthorized(false);
          }
        } else {
          console.log("Aucune session active trouvée");
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error("Erreur de vérification d'authentification:", error);
        toast.error("Erreur lors de la vérification des autorisations");
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
