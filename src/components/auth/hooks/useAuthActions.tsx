
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useAuthActions(
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDevelopmentMode = import.meta.env.DEV;

  const login = async (email: string, password: string) => {
    console.log("Login attempt with email:", email);
    
    if (isDevelopmentMode) {
      console.log("Development mode: Automatic login success");
      setIsAuthenticated(true);
      toast.success("Automatic login in development mode");
      return { success: true };
    }

    try {
      setIsSubmitting(true);
      
      // Check if user exists in internal_users table first
      const { data: internalUser, error: internalUserError } = await supabase
        .from("internal_users")
        .select("id, email")
        .eq("email", email.toLowerCase().trim())
        .single();
      
      console.log("Internal user check:", internalUser, internalUserError);
      
      if (internalUserError || !internalUser) {
        console.error("User not found in internal_users table:", internalUserError || "No user found");
        return { 
          success: false, 
          error: "Cet email n'est pas associé à un compte utilisateur interne" 
        };
      }

      console.log("Internal user found, attempting authentication");

      // Actually sign in with Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      console.log("Auth result:", data, error);

      if (error) {
        console.error("Authentication error:", error);
        return { 
          success: false, 
          error: error.message || "Identifiants invalides" 
        };
      }

      // Successfully authenticated
      console.log("Authentication successful");
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        error: "Une erreur est survenue lors de la connexion" 
      };
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const logout = async () => {
    if (isDevelopmentMode) {
      console.log("Development mode: Simulated logout");
      toast.success("You are logged out");
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        toast.error("Erreur lors de la déconnexion");
        return;
      }
      
      setIsAuthenticated(false);
      toast.success("Vous êtes déconnecté");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Une erreur est survenue lors de la déconnexion");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { login, logout, isSubmitting };
}
