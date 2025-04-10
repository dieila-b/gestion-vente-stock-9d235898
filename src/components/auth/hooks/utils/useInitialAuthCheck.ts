
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { verifyInternalUser } from "./authVerification";

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
    console.log("Checking authentication status...");
    console.log("Mode de développement:", isDevelopmentMode ? "Oui" : "Non");
    console.log("Mode de test:", testingMode ? "Oui" : "Non");

    // En mode développement ou mode test, authentification automatique
    if (isDevelopmentMode || testingMode) {
      console.log(isDevelopmentMode 
        ? "Development mode detected: Auto-authenticating user" 
        : "Testing mode detected: Auto-authenticating user in production");
      setIsAuthenticated(true);
      setLoading(false);
      return;
    }

    // En mode production, vérifier l'authentification avec Supabase
    const checkAuthStatus = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking authentication:", error);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        
        // Check if session exists and is valid
        const hasValidSession = !!data?.session;
        console.log("Auth session check:", hasValidSession ? "User is authenticated" : "No active session");
        
        if (hasValidSession && data.session?.user) {
          console.log("Valid session found for user:", data.session.user.email);
          
          // Get user's email from the session
          const userEmail = data.session.user.email;
          
          const { isValid, isActive } = await verifyInternalUser(userEmail);
          
          if (!isValid || !isActive) {
            // Déconnexion de l'utilisateur non valide ou désactivé
            await supabase.auth.signOut();
            setIsAuthenticated(false);
            setLoading(false);
            return;
          }
          
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }
        
        setIsAuthenticated(false);
        setLoading(false);
      } catch (error) {
        console.error("Auth state check error:", error);
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    // Initial auth check
    if (!isDevelopmentMode && !testingMode) {
      checkAuthStatus();
    }
  }, [isDevelopmentMode, testingMode, setIsAuthenticated, setLoading]);
}
