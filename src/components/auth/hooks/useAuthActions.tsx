
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
      
      // En mode développement, simuler un utilisateur local
      // Stocker des données utilisateur de démonstration dans le localStorage pour être utilisées ailleurs
      const demoUsers = [
        {
          id: "dev-1743844624581",
          first_name: "Dieila",
          last_name: "Barry",
          email: "wosyrab@gmail.com",
          phone: "623268781",
          address: "Matam",
          role: "admin",
          is_active: true,
          photo_url: null
        },
        {
          id: "dev-1743853323494",
          first_name: "Dieila",
          last_name: "Barry",
          email: "wosyrab@yahoo.fr",
          phone: "623268781",
          address: "Madina",
          role: "manager",
          is_active: true,
          photo_url: null
        }
      ];
      
      try {
        localStorage.setItem('internalUsers', JSON.stringify(demoUsers));
        console.log("Données utilisateurs de démonstration stockées dans localStorage");
      } catch (err) {
        console.error("Erreur lors du stockage des données démo:", err);
      }
      
      setIsAuthenticated(true);
      toast.success("Connexion automatique en mode développement");
      return { success: true };
    }

    try {
      setIsSubmitting(true);
      
      // Normalize the email
      const normalizedEmail = email.toLowerCase().trim();
      console.log("Login request with normalized email:", normalizedEmail);
      
      // First check if the user exists in internal_users table
      console.log("Checking if user exists in internal_users table");
      const { data: internalUser, error: internalUserError } = await supabase
        .from("internal_users")
        .select("id, email, role")
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
      
      // If user exists, attempt authentication with Supabase
      console.log("User exists, attempting authentication with Supabase");
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });

      console.log("Auth result:", data ? "Success" : "Failed", error);

      if (error) {
        console.error("Authentication error:", error);
        
        // If user exists but auth failed, it's likely a password issue
        if (error.message === "Invalid login credentials") {
          return { 
            success: false, 
            error: "Mot de passe incorrect" 
          };
        }
        
        // Generic error for other issues
        return { 
          success: false, 
          error: error.message || "Une erreur est survenue lors de la connexion" 
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
      setIsAuthenticated(false);
      toast.success("Vous êtes déconnecté");
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
