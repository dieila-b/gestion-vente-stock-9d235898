
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

    // In development mode or testing mode, auto-authenticate
    if (isDevelopmentMode || testingMode) {
      console.log(isDevelopmentMode 
        ? "Development mode detected: Auto-authenticating user" 
        : "Testing mode detected: Auto-authenticating user in production");
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

    // Only set up auth state change listener in normal production mode
    if (!isDevelopmentMode && !testingMode) {
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
  }, [isDevelopmentMode, testingMode]);

  return { 
    isAuthenticated, 
    setIsAuthenticated, 
    loading, 
    setLoading
  };
}
