
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
      
      // Normalisation de l'email
      const normalizedEmail = email.toLowerCase().trim();
      console.log("Login request with normalized email:", normalizedEmail);
      
      // First try authentication directly with Supabase
      console.log("Attempting direct authentication with Supabase");
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });

      console.log("Auth result:", data ? "Success" : "Failed", error);

      if (error) {
        console.error("Authentication error:", error);
        
        if (error.message === "Invalid login credentials") {
          return { 
            success: false, 
            error: "Mot de passe incorrect" 
          };
        }
        
        // If auth fails, check if the user exists in internal_users table
        console.log("Auth failed, checking if user exists in internal_users table");
        const { data: internalUser, error: internalUserError } = await supabase
          .from("internal_users")
          .select("id, email")
          .eq("email", normalizedEmail)
          .single();
          
        console.log("Internal user check result:", internalUser, internalUserError);
        
        if (internalUserError || !internalUser) {
          console.error("User not found in internal_users table:", internalUserError?.message || "No user found");
          return { 
            success: false, 
            error: "Cet email n'est pas associé à un compte utilisateur interne" 
          };
        }
        
        return { 
          success: false, 
          error: "Mot de passe incorrect" 
        };
      }

      // Successfully authenticated
      console.log("Authentication successful, user is now logged in");
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
