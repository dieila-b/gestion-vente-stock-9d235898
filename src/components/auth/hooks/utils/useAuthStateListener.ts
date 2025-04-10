
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { verifyInternalUser } from "./authVerification";

interface UseAuthStateListenerProps {
  isDevelopmentMode: boolean;
  testingMode: boolean;
  setIsAuthenticated: (value: boolean) => void;
}

export function useAuthStateListener({ 
  isDevelopmentMode, 
  testingMode, 
  setIsAuthenticated 
}: UseAuthStateListenerProps) {
  useEffect(() => {
    // Set up auth state change listener for production mode only
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, !!session);
        
        // En mode développement ou test, ignorer les changements d'état
        if (isDevelopmentMode || testingMode) {
          console.log("Development/Testing mode: Ignoring auth state change");
          return;
        }
        
        if (session && session.user) {
          // Get user's email
          const userEmail = session.user.email;
          
          if (!userEmail) {
            console.error("User session has no email");
            setIsAuthenticated(false);
            return;
          }
          
          const { isValid, isActive } = await verifyInternalUser(userEmail);
          
          if (!isValid || !isActive) {
            // Déconnexion de l'utilisateur non valide ou désactivé
            await supabase.auth.signOut();
            setIsAuthenticated(false);
            return;
          }
          
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      }
    );

    // Cleanup
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [isDevelopmentMode, testingMode, setIsAuthenticated]);
}
