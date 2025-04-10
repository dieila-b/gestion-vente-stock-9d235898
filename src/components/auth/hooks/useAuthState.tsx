
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

    // In testing mode only, auto-authenticate
    if (testingMode) {
      console.log("Testing mode detected: Auto-authenticating user in production");
      setIsAuthenticated(true);
      setLoading(false);
      return;
    }

    // Check authentication with Supabase in both production and development mode
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
          
          // In development mode, check internal_users in localStorage
          if (isDevelopmentMode) {
            try {
              const storedUsers = localStorage.getItem('internalUsers');
              if (!storedUsers) {
                console.error("No users found in localStorage for dev mode");
                setIsAuthenticated(false);
                setLoading(false);
                return;
              }
              
              const users = JSON.parse(storedUsers);
              const internalUser = users.find((u: any) => 
                u.email && u.email.toLowerCase().trim() === normalizedEmail
              );
              
              if (!internalUser) {
                console.error("User not found in internal_users dev storage:", normalizedEmail);
                setIsAuthenticated(false);
                setLoading(false);
                return;
              }
              
              if (!internalUser.is_active) {
                console.error("User is deactivated in dev mode:", normalizedEmail);
                setIsAuthenticated(false);
                setLoading(false);
                return;
              }
              
              console.log("User is active in dev mode internal_users:", normalizedEmail);
              setIsAuthenticated(true);
              setLoading(false);
              return;
            } catch (error) {
              console.error("Error checking dev mode users:", error);
              setIsAuthenticated(false);
              setLoading(false);
              return;
            }
          }
          
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

    // Set up auth state change listener for all modes
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
          
          // In development mode, check internal_users in localStorage
          if (isDevelopmentMode) {
            try {
              const storedUsers = localStorage.getItem('internalUsers');
              if (!storedUsers) {
                console.error("No users found in localStorage for dev mode");
                setIsAuthenticated(false);
                return;
              }
              
              const users = JSON.parse(storedUsers);
              const internalUser = users.find((u: any) => 
                u.email && u.email.toLowerCase().trim() === normalizedEmail
              );
              
              if (!internalUser) {
                console.error("User not found in internal_users dev storage:", normalizedEmail);
                setIsAuthenticated(false);
                return;
              }
              
              if (!internalUser.is_active) {
                console.error("User is deactivated in dev mode:", normalizedEmail);
                setIsAuthenticated(false);
                return;
              }
              
              console.log("User is active in dev mode internal_users:", normalizedEmail);
              setIsAuthenticated(true);
              return;
            } catch (error) {
              console.error("Error checking dev mode users:", error);
              setIsAuthenticated(false);
              return;
            }
          }
          
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
      }
    );

    // Initial auth check
    checkAuthStatus();

    // Cleanup
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [isDevelopmentMode, testingMode]);

  return { 
    isAuthenticated, 
    setIsAuthenticated, 
    loading, 
    setLoading
  };
}
