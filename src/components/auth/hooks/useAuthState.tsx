
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAuthState() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const isDevelopmentMode = import.meta.env.DEV;

  useEffect(() => {
    if (isDevelopmentMode) {
      console.log("Authentication disabled: All users are automatically authenticated");
      setIsAuthenticated(true);
      setLoading(false);
      return;
    }

    // In production mode, check if user is authenticated
    const checkAuthStatus = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking authentication:", error);
          setIsAuthenticated(false);
        } else {
          // Check if session exists and is valid
          setIsAuthenticated(!!data.session);
        }
      } catch (error) {
        console.error("Auth state check error:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    // Setup auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        setIsAuthenticated(!!session);
        setLoading(false);
      }
    );

    // Initial auth check
    checkAuthStatus();

    // Cleanup
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [isDevelopmentMode]);

  return { 
    isAuthenticated, 
    setIsAuthenticated, 
    loading, 
    setLoading, 
    isDevelopmentMode 
  };
}
