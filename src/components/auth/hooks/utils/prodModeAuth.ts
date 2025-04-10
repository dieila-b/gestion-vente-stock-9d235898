
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Handle login in production mode
export const handleProdModeLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // En mode test, on accepte n'importe quel email/mot de passe
    if (localStorage.getItem('auth_testing_mode') === 'enabled') {
      console.log("Mode test: authentification automatique avec:", email);
      return { success: true };
    }
    
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    console.log("Login request with normalized email:", normalizedEmail);
    
    // Vérifier d'abord si l'utilisateur existe dans internal_users
    const { data: internalUsers, error: internalUserError } = await supabase
      .from("internal_users")
      .select("email, is_active")
      .eq("email", normalizedEmail);
      
    if (internalUserError) {
      console.error("Error checking internal_users:", internalUserError.message);
      return { 
        success: false, 
        error: "Erreur lors de la vérification du compte: " + internalUserError.message
      };
    }
    
    // Si aucun utilisateur trouvé
    if (!internalUsers || internalUsers.length === 0) {
      console.error("User not found in internal_users table:", normalizedEmail);
      return { 
        success: false, 
        error: "Cet email n'est pas associé à un compte utilisateur interne" 
      };
    }
    
    const internalUserByEmail = internalUsers[0];
    
    // Vérifier si l'utilisateur est actif
    if (internalUserByEmail && !internalUserByEmail.is_active) {
      console.error("User exists but is deactivated:", normalizedEmail);
      return {
        success: false,
        error: "Ce compte utilisateur a été désactivé. Contactez votre administrateur."
      };
    }
    
    // Maintenant tenter l'authentification avec Supabase
    console.log("Attempting authentication with Supabase for internal user:", normalizedEmail);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });
    
    if (authError) {
      console.error("Authentication error:", authError);
      
      if (authError.message.includes("Invalid login credentials")) {
        return { 
          success: false, 
          error: "Mot de passe incorrect" 
        };
      }
      
      return { 
        success: false, 
        error: authError.message || "Une erreur est survenue lors de la connexion" 
      };
    }
    
    if (authData?.user) {
      console.log("Authentication successful for internal user:", normalizedEmail);
      return { success: true };
    }
    
    // Erreur générique pour les autres problèmes
    return { 
      success: false, 
      error: "Une erreur est survenue lors de la connexion" 
    };
  } catch (error: any) {
    console.error("Login error:", error);
    return { 
      success: false, 
      error: "Une erreur est survenue lors de la connexion: " + (error.message || "Erreur inconnue")
    };
  }
};
