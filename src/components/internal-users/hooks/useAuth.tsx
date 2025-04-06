
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  useEffect(() => {
    const verifyPermissions = async () => {
      try {
        console.log("Vérification des permissions utilisateur...");
        
        // Get current authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          console.error("Erreur d'authentification:", authError);
          setIsAuthorized(false);
          setIsAuthChecking(false);
          return;
        }
        
        // Check if user has admin or manager role
        const { data: userData, error: userError } = await supabase
          .from("internal_users")
          .select("role")
          .eq("id", user.id)
          .single();
        
        if (userError || !userData) {
          console.error("Erreur lors de la vérification des permissions:", userError);
          setIsAuthorized(false);
          setIsAuthChecking(false);
          return;
        }
        
        // Check if user has required role
        const hasPermission = ['admin', 'manager'].includes(userData.role);
        console.log("Résultat de la vérification des permissions:", hasPermission);
        
        setIsAuthorized(hasPermission);
        setIsAuthChecking(false);
      } catch (error) {
        console.error("Erreur lors de la vérification des permissions:", error);
        setIsAuthorized(false);
        setIsAuthChecking(false);
      }
    };
    
    verifyPermissions();
  }, []);
  
  return { 
    isAuthChecking, 
    isAuthorized 
  };
};
