
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { verifyInternalUser } from "./utils/verifyInternalUser";

export function useAuthState() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const isDevelopmentMode = false; // Force this to always be false

  useEffect(() => {
    // Always use production mode authentication
    const authSubscription = setupAuthListener();
    checkInitialAuthStatus();

    // Cleanup
    return () => {
      authSubscription.data.subscription.unsubscribe();
    };
  }, []);

  // Check initial authentication state
  const checkInitialAuthStatus = async () => {
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
        // Verify if the authenticated user is in internal_users table
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            console.log("Auth user found:", user.id, user.email);
            const internalUser = await verifyInternalUser(user);
            
            if (!internalUser) {
              console.error("User not found in internal_users table");
              setIsAuthenticated(false);
            } else if (!internalUser.is_active) {
              console.error("User account is not active");
              setIsAuthenticated(false);
            } else {
              console.log("Valid internal user found:", internalUser.email || internalUser.id, "Role:", internalUser.role);
              setIsAuthenticated(true);
            }
          } else {
            setIsAuthenticated(false);
          }
        } catch (verifyError) {
          console.error("Error verifying internal user:", verifyError);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Auth state check error:", error);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  // Setup auth state change listener
  const setupAuthListener = () => {
    return supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, !!session);
        
        if (session) {
          // Verify the user is in internal_users table
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const internalUser = await verifyInternalUser(user);
              
              if (!internalUser) {
                console.error("User not found in internal_users table");
                setIsAuthenticated(false);
              } else if (!internalUser.is_active) {
                console.error("User account is not active");
                setIsAuthenticated(false);
              } else {
                console.log("Valid internal user found:", internalUser.email || internalUser.id, "Role:", internalUser.role);
                setIsAuthenticated(true);
              }
            } else {
              setIsAuthenticated(false);
            }
          } catch (verifyError) {
            console.error("Error verifying internal user:", verifyError);
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
        
        setLoading(false);
      }
    );
  };

  return { 
    isAuthenticated, 
    setIsAuthenticated, 
    loading, 
    setLoading, 
    isDevelopmentMode: false // Always return false
  };
}
