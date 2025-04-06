
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useAuthActions(
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = async (email: string, password: string) => {
    console.log("Login attempt with email:", email);
    
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
        if (error.message.includes("Invalid login credentials")) {
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
      
      try {
        // Get current authenticated user
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData || !userData.user) {
          console.error("Could not get authenticated user data");
          await supabase.auth.signOut();
          return {
            success: false,
            error: "Erreur lors de la vérification des informations utilisateur"
          };
        }
        
        // Try first by email
        let internalUser = null;
        
        if (userData.user.email) {
          console.log("Checking internal user by email:", userData.user.email);
          const { data: userByEmail, error: userByEmailError } = await supabase
            .from("internal_users")
            .select("id, email, role, is_active")
            .eq("email", userData.user.email.toLowerCase())
            .maybeSingle();
          
          if (!userByEmailError && userByEmail) {
            console.log("Internal user found by email:", userByEmail);
            internalUser = userByEmail;
          } else {
            console.log("User not found by email, error:", userByEmailError?.message || "No user");
          }
        }
        
        // If not found by email, try by ID
        if (!internalUser) {
          console.log("Checking internal user by ID:", userData.user.id);
          const { data: userById, error: userByIdError } = await supabase
            .from("internal_users")
            .select("id, email, role, is_active")
            .eq("id", userData.user.id)
            .maybeSingle();
          
          if (!userByIdError && userById) {
            console.log("Internal user found by ID:", userById);
            internalUser = userById;
          } else {
            console.log("User not found by ID, error:", userByIdError?.message || "No user");
          }
        }
        
        // Check if we found a valid internal user
        if (!internalUser) {
          console.error("User not found in internal_users table");
          
          // Sign out the user since they're not an internal user
          await supabase.auth.signOut();
          
          return { 
            success: false, 
            error: "Cet utilisateur n'est pas associé à un compte interne" 
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

        // Valid internal user
        console.log("User is valid internal user with role:", internalUser.role);
        setIsAuthenticated(true);
        toast.success("Connexion réussie");
        return { success: true };
        
      } catch (verifyError) {
        console.error("Error verifying internal user:", verifyError);
        await supabase.auth.signOut();
        return { 
          success: false, 
          error: "Erreur lors de la vérification de l'utilisateur" 
        };
      }
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
