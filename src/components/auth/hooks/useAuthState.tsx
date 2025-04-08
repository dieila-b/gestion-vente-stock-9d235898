
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAuthState() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const isDevelopmentMode = import.meta.env.DEV;

  useEffect(() => {
    console.log("Checking authentication status...");

    // In development mode, auto-authenticate
    if (isDevelopmentMode) {
      console.log("Development mode detected: Auto-authenticating user");
      setIsAuthenticated(true);
      setLoading(false);
      return;
    }

    // Only check authentication with Supabase in production mode
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
        
        if (hasValidSession) {
          // Verify that user exists in internal_users
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
            
            // Check if user is active
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

    // Only set up auth state change listener in production mode
    if (!isDevelopmentMode) {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log("Auth state changed:", event, !!session);
          
          if (session) {
            // Verify that user exists in internal_users and is active
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

      // Initial auth check for production
      checkAuthStatus();

      // Cleanup
      return () => {
        authListener?.subscription.unsubscribe();
      };
    }
  }, [isDevelopmentMode]);

  return { 
    isAuthenticated, 
    setIsAuthenticated, 
    loading, 
    setLoading
  };
}
