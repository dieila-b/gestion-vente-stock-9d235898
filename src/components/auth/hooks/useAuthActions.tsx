import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useAuthActions(
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDevelopmentMode = true; // Force development mode behavior

  const login = async (email: string, password: string) => {
    // Simulate a successful login immediately
    console.log("Mode sans authentification: Connexion automatique");
    setIsAuthenticated(true);
    toast.success("Connexion automatique");
    return { success: true };
  };
  
  const logout = async () => {
    // Simulate logout but keep authenticated
    console.log("Mode sans authentification: Déconnexion simulée");
    toast.success("Vous êtes déconnecté");
    // Note: we don't actually change isAuthenticated state
  };

  return { login, logout, isSubmitting: false };
}
