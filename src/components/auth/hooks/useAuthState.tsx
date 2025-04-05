
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useAuthState() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Always set to true by default
  const [loading, setLoading] = useState(false); // Set loading to false by default
  const isDevelopmentMode = true; // Force development mode behavior always

  useEffect(() => {
    // Authentication is completely disabled, so we just set authenticated to true
    console.log("Authentification désactivée: Tous les utilisateurs sont automatiquement authentifiés");
    setIsAuthenticated(true);
    setLoading(false);
    
    // No need to check sessions or subscribe to auth changes
    return () => {
      // No cleanup needed
    };
  }, []);

  // Always return as authenticated
  return { 
    isAuthenticated: true, 
    setIsAuthenticated, 
    loading: false, 
    setLoading, 
    isDevelopmentMode: true // Force development mode behavior
  };
}
