
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { verifyInternalUser } from "./authVerification";
import { toast } from "sonner";

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
    console.log("Configuration de l'écouteur d'état d'authentification");
    
    // Configurer l'écouteur d'état d'authentification uniquement en mode production
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Changement d'état d'authentification:", event, !!session);
        
        // En mode développement ou test, ignorer les changements d'état
        if (isDevelopmentMode || testingMode) {
          console.log("Mode développement/test: Ignorer le changement d'état d'authentification");
          return;
        }
        
        if (event === "SIGNED_OUT") {
          console.log("Utilisateur déconnecté");
          setIsAuthenticated(false);
          toast.info("Vous avez été déconnecté");
          return;
        }
        
        if (session && session.user) {
          // Obtenir l'email de l'utilisateur
          const userEmail = session.user.email;
          
          if (!userEmail) {
            console.error("La session utilisateur n'a pas d'email");
            setIsAuthenticated(false);
            return;
          }
          
          const { isValid, isActive } = await verifyInternalUser(userEmail);
          
          if (!isValid || !isActive) {
            // Déconnexion de l'utilisateur non valide ou désactivé
            console.log("Utilisateur non valide ou désactivé, déconnexion...");
            await supabase.auth.signOut();
            setIsAuthenticated(false);
            toast.error("Accès non autorisé - Compte non valide ou désactivé");
            return;
          }
          
          console.log("Utilisateur authentifié avec succès:", userEmail);
          setIsAuthenticated(true);
          toast.success("Authentification réussie");
        } else {
          console.log("Aucune session utilisateur active");
          setIsAuthenticated(false);
        }
      }
    );

    // Nettoyage
    return () => {
      console.log("Nettoyage de l'écouteur d'authentification");
      authListener?.subscription.unsubscribe();
    };
  }, [isDevelopmentMode, testingMode, setIsAuthenticated]);
}
