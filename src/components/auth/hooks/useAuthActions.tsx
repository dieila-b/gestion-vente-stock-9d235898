
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DEV_USERS_STORAGE_KEY } from "@/components/internal-users/hooks/userData/localStorage";

export function useAuthActions(
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDevelopmentMode = import.meta.env.DEV;

  const login = async (email: string, password: string) => {
    console.log("Login attempt with email:", email);
    
    if (isDevelopmentMode) {
      console.log("Development mode: Authentication completely disabled");
      setIsAuthenticated(true);
      toast.success("Connexion réussie en mode développement");
      return { success: true };
    }

    try {
      setIsSubmitting(true);
      
      // Normalize the email
      const normalizedEmail = email.toLowerCase().trim();
      console.log("Login request with normalized email:", normalizedEmail);
      
      // First, try to authenticate directly with Supabase
      console.log("Attempting authentication with Supabase");
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });

      console.log("Auth result:", data ? "Success" : "Failed", error);

      if (error) {
        console.error("Authentication error:", error);
        
        // Check if it's an invalid credentials error
        if (error.message === "Invalid login credentials") {
          return { 
            success: false, 
            error: "Email ou mot de passe incorrect" 
          };
        }
        
        // Generic error for other issues
        return { 
          success: false, 
          error: error.message || "Une erreur est survenue lors de la connexion" 
        };
      }

      // If authentication successful, check if user is in internal_users table
      console.log("Authentication successful, checking if user is an internal user");
      
      const { data: internalUser, error: internalUserError } = await supabase
        .from("internal_users")
        .select("id, email, role, is_active")
        .eq("email", normalizedEmail)
        .single();
        
      console.log("Internal user check result:", internalUser, internalUserError);
      
      if (internalUserError) {
        console.error("Error checking internal user:", internalUserError.message);
        
        // Don't sign out immediately, try by ID
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user && user.id) {
          const { data: internalUserById, error: internalUserByIdError } = await supabase
            .from("internal_users")
            .select("id, email, role, is_active")
            .eq("id", user.id)
            .single();
            
          if (internalUserByIdError || !internalUserById) {
            console.error("User not found by ID in internal_users table:", internalUserByIdError?.message || "No user found");
            
            // Sign out the user since they're not an internal user
            await supabase.auth.signOut();
            
            return { 
              success: false, 
              error: "Cet utilisateur n'est pas associé à un compte interne" 
            };
          }
          
          // Found by ID - check if active
          if (!internalUserById.is_active) {
            console.error("User account is not active");
            
            // Sign out the user since their account is not active
            await supabase.auth.signOut();
            
            return { 
              success: false, 
              error: "Votre compte est désactivé. Veuillez contacter l'administrateur." 
            };
          }
          
          // Valid internal user by ID
          console.log("User is valid internal user by ID:", internalUserById.email || internalUserById.id);
          setIsAuthenticated(true);
          return { success: true };
        } else {
          // No user data available
          await supabase.auth.signOut();
          return { 
            success: false, 
            error: "Cet email n'est pas associé à un compte utilisateur interne" 
          };
        }
      }
      
      if (!internalUser) {
        console.error("No internal user found for email:", normalizedEmail);
        
        // Sign out the user since they're not an internal user
        await supabase.auth.signOut();
        
        return { 
          success: false, 
          error: "Cet email n'est pas associé à un compte utilisateur interne" 
        };
      }
      
      // Check if user is active
      if (!internalUser.is_active) {
        console.error("User account is not active");
        
        // Sign out the user since their account is not active
        await supabase.auth.signOut();
        
        return { 
          success: false, 
          error: "Votre compte est désactivé. Veuillez contacter l'administrateur." 
        };
      }

      // Successfully authenticated and user is valid internal user
      console.log("User is authenticated and is a valid internal user");
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
