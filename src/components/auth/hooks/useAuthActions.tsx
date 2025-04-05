
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
      console.log("Checking internal user with normalized email:", normalizedEmail);
      
      // Check if user exists in internal_users table first
      const { data: internalUser, error: internalUserError } = await supabase
        .from("internal_users")
        .select("id, email")
        .eq("email", normalizedEmail)
        .single();
      
      console.log("Internal user check result:", internalUser, internalUserError);
      
      if (internalUserError) {
        console.error("Error querying internal_users:", internalUserError.message);
        if (internalUserError.code === "PGRST116") {
          // Code PGRST116 correspond à "Did not return a single row"
          return { 
            success: false, 
            error: "Cet email n'est pas associé à un compte utilisateur interne" 
          };
        }
        return { 
          success: false, 
          error: "Erreur lors de la vérification de l'utilisateur" 
        };
      }
      
      if (!internalUser) {
        console.error("No user found in internal_users table");
        return { 
          success: false, 
          error: "Cet email n'est pas associé à un compte utilisateur interne" 
        };
      }

      console.log("Internal user found, attempting authentication with Supabase auth");

      // Actually sign in with Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });

      console.log("Auth result:", data ? "Success" : "Failed", error);

      if (error) {
        console.error("Authentication error:", error);
        return { 
          success: false, 
          error: error.message === "Invalid login credentials" 
            ? "Mot de passe incorrect" 
            : error.message || "Identifiants invalides" 
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
