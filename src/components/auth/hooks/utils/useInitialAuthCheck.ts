
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { verifyInternalUser } from "./authVerification";
import { toast } from "sonner";

interface UseInitialAuthCheckProps {
  isDevelopmentMode: boolean;
  testingMode: boolean;
  setIsAuthenticated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
}

export function useInitialAuthCheck({ 
  isDevelopmentMode, 
  testingMode,
  setIsAuthenticated,
  setLoading
}: UseInitialAuthCheckProps) {
  useEffect(() => {
    console.log("Vérification de l'état d'authentification...");
    console.log("Mode de développement:", isDevelopmentMode ? "Oui" : "Non");
    console.log("Mode de test:", testingMode ? "Oui" : "Non");

    // En mode développement ou mode test, authentification automatique
    if (isDevelopmentMode || testingMode) {
      console.log(isDevelopmentMode 
        ? "Mode développement détecté: Auto-authentification de l'utilisateur" 
        : "Mode test détecté: Auto-authentification de l'utilisateur en production");
      setIsAuthenticated(true);
      setLoading(false);
      
      if (isDevelopmentMode) {
        toast.success("Mode développement: Authentification automatique");
      } else if (testingMode) {
        toast.info("Mode test: Authentification automatique activée");
      }
      return;
    }

    // En mode production, vérifier l'authentification avec Supabase
    const checkAuthStatus = async () => {
      try {
        console.log("Vérification du statut d'authentification en mode production...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erreur lors de la vérification de l'authentification:", error);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        
        // Vérifier si la session existe et est valide
        const hasValidSession = !!data?.session;
        console.log("Vérification de la session auth:", hasValidSession ? "L'utilisateur est authentifié" : "Aucune session active");
        
        if (hasValidSession && data.session?.user) {
          console.log("Session valide trouvée pour l'utilisateur:", data.session.user.email);
          
          // Obtenir l'email de l'utilisateur à partir de la session
          const userEmail = data.session.user.email;
          
          if (!userEmail) {
            console.error("La session utilisateur n'a pas d'email");
            setIsAuthenticated(false);
            setLoading(false);
            return;
          }
          
          const { isValid, isActive } = await verifyInternalUser(userEmail);
          
          if (!isValid || !isActive) {
            // Déconnexion de l'utilisateur non valide ou désactivé
            console.log("Utilisateur non valide ou désactivé, déconnexion...");
            await supabase.auth.signOut();
            setIsAuthenticated(false);
            setLoading(false);
            toast.error("Accès non autorisé - Compte non valide ou désactivé");
            return;
          }
          
          console.log("Utilisateur valide et actif:", userEmail);
          setIsAuthenticated(true);
          setLoading(false);
          toast.success("Session authentifiée");
          return;
        }
        
        console.log("Aucune session valide trouvée");
        setIsAuthenticated(false);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la vérification de l'état d'authentification:", error);
        setIsAuthenticated(false);
        setLoading(false);
        toast.error("Erreur lors de la vérification de l'authentification");
      }
    };

    // Vérification initiale de l'authentification
    if (!isDevelopmentMode && !testingMode) {
      checkAuthStatus();
    }
  }, [isDevelopmentMode, testingMode, setIsAuthenticated, setLoading]);
}
