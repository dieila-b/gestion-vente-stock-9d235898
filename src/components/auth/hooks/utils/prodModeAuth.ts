
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Handle login in production mode
export const handleProdModeLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    console.log("Login request with normalized email:", normalizedEmail);
    
    // First check if user exists in internal_users table
    console.log("Checking if user exists in internal_users table");
    const { data: internalUser, error: internalUserError } = await supabase
      .from("internal_users")
      .select("id, email, role, is_active")
      .eq("email", normalizedEmail)
      .maybeSingle();
      
    console.log("Internal user check result:", internalUser, internalUserError);
    
    if (internalUserError) {
      console.error("Error checking internal_users:", internalUserError.message);
      return { 
        success: false, 
        error: "Erreur lors de la vérification du compte: " + internalUserError.message
      };
    }
    
    if (!internalUser) {
      console.error("User not found in internal_users table");
      return { 
        success: false, 
        error: "Cet email n'est pas associé à un compte utilisateur interne" 
      };
    }
    
    // Check if user is active
    if (!internalUser.is_active) {
      console.error("User account is inactive:", internalUser.email);
      return {
        success: false,
        error: "Ce compte utilisateur a été désactivé. Contactez votre administrateur."
      };
    }
    
    // If user exists and is active, attempt authentication with Supabase
    console.log("User exists and is active, attempting authentication with Supabase");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });

    console.log("Auth result:", data ? "Success" : "Failed", error);

    if (error) {
      console.error("Authentication error:", error);
      
      // If user exists but authentication failed, it's probably a password issue
      if (error.message.includes("Invalid login credentials")) {
        return { 
          success: false, 
          error: "Mot de passe incorrect" 
        };
      }
      
      // Generic error for other problems
      return { 
        success: false, 
        error: error.message || "Une erreur est survenue lors de la connexion" 
      };
    }

    // Authentication successful
    console.log("Authentication successful, user is now logged in");
    return { success: true };
  } catch (error: any) {
    console.error("Login error:", error);
    return { 
      success: false, 
      error: "Une erreur est survenue lors de la connexion: " + (error.message || "Erreur inconnue")
    };
  }
};
