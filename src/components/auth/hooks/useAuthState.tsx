
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAuthState() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const isDevelopmentMode = import.meta.env.DEV;

  useEffect(() => {
    console.log("Authentication required for all users, even in development mode");

    // Check authentication status
    const checkAuthStatus = async () => {
      try {
        console.log("Checking authentication status...");
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
        
        if (hasValidSession) {
          // Vérifier que l'utilisateur existe dans internal_users
          const { data: userData } = await supabase.auth.getUser();
          if (userData && userData.user) {
            const { data: internalUser, error: internalError } = await supabase
              .from('internal_users')
              .select('id, is_active')
              .eq('id', userData.user.id)
              .single();
              
            if (internalError || !internalUser) {
              console.error("User not found in internal_users or error:", internalError?.message);
              setIsAuthenticated(false);
              setLoading(false);
              return;
            }
            
            // Vérifier si l'utilisateur est actif
            if (!internalUser.is_active) {
              console.error("User is deactivated:", userData.user.id);
              setIsAuthenticated(false);
              setLoading(false);
              return;
            }
          }
        }
        
        setIsAuthenticated(hasValidSession);
        setLoading(false);
      } catch (error) {
        console.error("Auth state check error:", error);
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    // Setup auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, !!session);
        
        if (session) {
          // Vérifier que l'utilisateur existe dans internal_users et est actif
          const { data: internalUser, error: internalError } = await supabase
            .from('internal_users')
            .select('id, is_active')
            .eq('id', session.user.id)
            .single();
            
          if (internalError || !internalUser || !internalUser.is_active) {
            console.error("User not in internal_users, not active, or error:", internalError?.message);
            setIsAuthenticated(false);
          } else {
            setIsAuthenticated(true);
          }
        } else {
          setIsAuthenticated(false);
        }
        
        setLoading(false);
      }
    );

    // Initial auth check
    checkAuthStatus();

    // Cleanup
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { 
    isAuthenticated, 
    setIsAuthenticated, 
    loading, 
    setLoading, 
    isDevelopmentMode 
  };
}
