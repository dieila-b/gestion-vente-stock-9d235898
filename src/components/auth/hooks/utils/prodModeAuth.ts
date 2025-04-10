
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
    
    // Tenter d'abord l'authentification avec Supabase
    console.log("Attempting authentication with Supabase for:", normalizedEmail);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });
    
    if (authError) {
      console.error("Authentication error:", authError);
      
      if (authError.message.includes("Invalid login credentials")) {
        return { 
          success: false, 
          error: "Email ou mot de passe incorrect" 
        };
      }
      
      return { 
        success: false, 
        error: authError.message || "Une erreur est survenue lors de la connexion" 
      };
    }
    
    if (!authData?.user) {
      console.error("No user data returned from authentication");
      return {
        success: false,
        error: "Erreur d'authentification: aucune donnée utilisateur"
      };
    }
    
    // Une fois authentifié, vérifier si l'utilisateur existe dans internal_users
    const userEmail = authData.user.email?.toLowerCase().trim();
    console.log("User authenticated, checking internal_users table for:", userEmail);
    
    if (!userEmail) {
      console.error("Authenticated user has no email");
      return { 
        success: false, 
        error: "Erreur: le compte authentifié n'a pas d'email associé" 
      };
    }
    
    // Vérifier dans internal_users si l'utilisateur existe et est actif
    const { data: internalUsers, error: internalUserError } = await supabase
      .from("internal_users")
      .select("email, is_active")
      .ilike("email", userEmail)  // Utiliser ilike pour une recherche insensible à la casse
      .limit(1);
      
    if (internalUserError) {
      console.error("Error checking internal_users:", internalUserError.message);
      return { 
        success: false, 
        error: "Erreur lors de la vérification du compte: " + internalUserError.message
      };
    }
    
    // Si aucun utilisateur trouvé
    if (!internalUsers || internalUsers.length === 0) {
      console.error("User not found in internal_users table:", userEmail);
      
      // Déconnexion de l'utilisateur authentifié qui n'est pas dans internal_users
      await supabase.auth.signOut();
      
      return { 
        success: false, 
        error: "Cet email n'est pas associé à un compte utilisateur interne" 
      };
    }
    
    const internalUserByEmail = internalUsers[0];
    
    // Vérifier si l'utilisateur est actif
    if (internalUserByEmail && !internalUserByEmail.is_active) {
      console.error("User exists but is deactivated:", userEmail);
      
      // Déconnexion de l'utilisateur désactivé
      await supabase.auth.signOut();
      
      return {
        success: false,
        error: "Ce compte utilisateur a été désactivé. Contactez votre administrateur."
      };
    }
    
    console.log("Authentication successful for internal user:", userEmail);
    return { success: true };
    
  } catch (error: any) {
    console.error("Login error:", error);
    return { 
      success: false, 
      error: "Une erreur est survenue lors de la connexion: " + (error.message || "Erreur inconnue")
    };
  }
};
