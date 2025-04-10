
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
    
    // Essayer d'abord l'authentification directe sans vérifier internal_users
    // pour les utilisateurs existants dans auth mais pas encore dans internal_users
    console.log("Attempting direct authentication with Supabase");
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });
    
    if (!authError && authData?.user) {
      console.log("Authentication successful, now checking if the user exists in internal_users");
      
      // Si l'authentification réussit, vérifier si l'utilisateur existe dans internal_users
      const { data: internalUser, error: internalUserError } = await supabase
        .from("internal_users")
        .select("id, email, role, is_active")
        .eq("id", authData.user.id)
        .maybeSingle();
      
      // Si l'utilisateur n'existe pas dans internal_users mais existe dans auth, on crée un enregistrement
      if (!internalUser && !internalUserError) {
        console.log("User exists in auth but not in internal_users, creating a record");
        
        // Créer un nouvel utilisateur interne à partir des données d'authentification
        const { error: createError } = await supabase
          .from("internal_users")
          .insert([{
            id: authData.user.id,
            email: normalizedEmail,
            first_name: "Utilisateur",
            last_name: "Temporaire",
            role: "employee", // Role par défaut
            is_active: true,
            phone: null,
            address: null
          }]);
          
        if (createError) {
          console.error("Error creating internal user:", createError);
          return { 
            success: false, 
            error: "Erreur lors de la création de l'utilisateur interne: " + createError.message 
          };
        }
        
        console.log("Internal user record created successfully");
        return { success: true };
      }
      
      // Vérifier si l'utilisateur est actif
      if (internalUser && !internalUser.is_active) {
        console.error("User account is inactive:", normalizedEmail);
        return {
          success: false,
          error: "Ce compte utilisateur a été désactivé. Contactez votre administrateur."
        };
      }
      
      // Si tout est bon, on valide la connexion
      if (internalUser) {
        console.log("User exists in internal_users and is active");
        return { success: true };
      }
    }
    
    // Si l'authentification directe échoue, on vérifie si l'email existe dans internal_users
    console.log("Direct authentication failed, checking if email exists in internal_users");
    const { data: internalUserByEmail, error: internalUserError } = await supabase
      .from("internal_users")
      .select("email, is_active")
      .eq("email", normalizedEmail)
      .maybeSingle();
      
    if (internalUserError) {
      console.error("Error checking internal_users:", internalUserError.message);
      return { 
        success: false, 
        error: "Erreur lors de la vérification du compte: " + internalUserError.message
      };
    }
    
    if (!internalUserByEmail) {
      console.error("User not found in internal_users table:", normalizedEmail);
      return { 
        success: false, 
        error: "Cet email n'est pas associé à un compte utilisateur interne" 
      };
    }
    
    // Si l'utilisateur existe dans internal_users mais l'authentification a échoué
    // c'est probablement un problème de mot de passe
    console.error("User exists in internal_users but authentication failed:", normalizedEmail);
    if (authError) {
      console.error("Authentication error:", authError);
      
      if (authError.message.includes("Invalid login credentials")) {
        return { 
          success: false, 
          error: "Mot de passe incorrect" 
        };
      }
    }
    
    // Erreur générique pour les autres problèmes
    return { 
      success: false, 
      error: authError?.message || "Une erreur est survenue lors de la connexion" 
    };
  } catch (error: any) {
    console.error("Login error:", error);
    return { 
      success: false, 
      error: "Une erreur est survenue lors de la connexion: " + (error.message || "Erreur inconnue")
    };
  }
};
