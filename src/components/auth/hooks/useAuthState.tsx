
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDevMode } from "./useDevMode";
import { useTestingMode } from "./useTestingMode";

export function useAuthState() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isDevelopmentMode } = useDevMode();
  const { testingMode } = useTestingMode();

  useEffect(() => {
    console.log("Checking authentication status...");
    console.log("Mode de développement:", isDevelopmentMode ? "Oui" : "Non");
    console.log("Mode de test:", testingMode ? "Oui" : "Non");

    // In development mode or testing mode, auto-authenticate
    if (isDevelopmentMode || testingMode) {
      console.log(isDevelopmentMode 
        ? "Development mode detected: Auto-authenticating user" 
        : "Testing mode detected: Auto-authenticating user in production");
        
      // En mode développement, s'assurer d'avoir des utilisateurs par défaut
      if (isDevelopmentMode) {
        try {
          // S'assurer que nous avons des utilisateurs dans le localStorage
          const storedUsers = localStorage.getItem('internalUsers');
          
          if (!storedUsers) {
            // Créer des utilisateurs par défaut si inexistants
            const defaultUsers = [
              {
                id: "dev-1743844624581",
                first_name: "Dieila",
                last_name: "Barry",
                email: "wosyrab@gmail.com",
                phone: "623268781",
                address: "Matam",
                role: "admin",
                is_active: true,
                photo_url: null
              },
              {
                id: "dev-1743853323494",
                first_name: "Dieila",
                last_name: "Barry",
                email: "wosyrab@yahoo.fr",
                phone: "623268781",
                address: "Madina",
                role: "manager",
                is_active: true,
                photo_url: null
              },
              {
                id: "dev-1743853323495",
                first_name: "Dieila",
                last_name: "Barry",
                email: "dielabarry@outlook.com",
                phone: "623268781",
                address: "Madina",
                role: "manager",
                is_active: true,
                photo_url: null
              }
            ];
            localStorage.setItem('internalUsers', JSON.stringify(defaultUsers));
            console.log("Utilisateurs démo créés pour useAuthState");
          }
        } catch (err) {
          console.error("Erreur lors de la création des utilisateurs démo:", err);
        }
      }
      
      setIsAuthenticated(true);
      setLoading(false);
      return;
    }

    // Only check authentication with Supabase in normal production mode
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
          
          if (!userEmail) {
            console.error("User session has no email");
            setIsAuthenticated(false);
            setLoading(false);
            return;
          }
          
          const normalizedEmail = userEmail.toLowerCase().trim();
          
          // Verify that user exists in internal_users
          const { data: internalUsers, error: internalError } = await supabase
            .from('internal_users')
            .select('id, email, is_active')
            .ilike('email', normalizedEmail)
            .limit(1);
              
          if (internalError) {
            console.error("Error checking internal_users:", internalError.message);
            setIsAuthenticated(false);
            setLoading(false);
            return;
          }
          
          if (!internalUsers || internalUsers.length === 0) {
            console.error("User not found in internal_users:", normalizedEmail);
            
            // Déconnexion de l'utilisateur authentifié qui n'est pas dans internal_users
            await supabase.auth.signOut();
            
            setIsAuthenticated(false);
            setLoading(false);
            return;
          }
            
          // Check if user is active
          const internalUser = internalUsers[0];
          if (!internalUser.is_active) {
            console.error("User is deactivated:", normalizedEmail);
            
            // Déconnexion de l'utilisateur désactivé
            await supabase.auth.signOut();
            
            setIsAuthenticated(false);
            setLoading(false);
            return;
          }
          
          console.log("User is active in internal_users:", normalizedEmail);
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

    // Only set up auth state change listener in normal production mode
    if (!isDevelopmentMode && !testingMode) {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log("Auth state changed:", event, !!session);
          
          if (session && session.user) {
            // Get user's email
            const userEmail = session.user.email;
            
            if (!userEmail) {
              console.error("User session has no email");
              setIsAuthenticated(false);
              return;
            }
            
            const normalizedEmail = userEmail.toLowerCase().trim();
            
            // Verify that user exists in internal_users and is active
            const { data: internalUsers, error: internalError } = await supabase
              .from('internal_users')
              .select('id, email, is_active')
              .ilike('email', normalizedEmail)
              .limit(1);
              
            if (internalError) {
              console.error("Error checking internal_users on auth change:", internalError.message);
              setIsAuthenticated(false);
              return;
            }
            
            if (!internalUsers || internalUsers.length === 0) {
              console.error("User not found in internal_users on auth change:", normalizedEmail);
              
              // Déconnexion de l'utilisateur authentifié qui n'est pas dans internal_users
              await supabase.auth.signOut();
              
              setIsAuthenticated(false);
              return;
            }
            
            // Check if user is active
            const internalUser = internalUsers[0];
            if (!internalUser.is_active) {
              console.error("User is deactivated on auth change:", normalizedEmail);
              
              // Déconnexion de l'utilisateur désactivé
              await supabase.auth.signOut();
              
              setIsAuthenticated(false);
              return;
            }
            
            console.log("User is active in internal_users on auth change:", normalizedEmail);
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
          
          setLoading(false);
        }
      );

      // Initial auth check for production
      checkAuthStatus();

      // Cleanup
      return () => {
        authListener?.subscription.unsubscribe();
      };
    }
  }, [isDevelopmentMode, testingMode]);

  return { 
    isAuthenticated, 
    setIsAuthenticated, 
    loading, 
    setLoading
  };
}
