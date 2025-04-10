
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Gérer la connexion en mode production
export const handleProdModeLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Log pour débugger
    console.log("Tentative de connexion avec:", email, "Mot de passe fourni:", password ? "******" : "non fourni");
    
    // En mode test, on accepte n'importe quel email/mot de passe
    if (localStorage.getItem('auth_testing_mode') === 'enabled') {
      console.log("Mode test: authentification automatique avec:", email);
      return { success: true };
    }
    
    // Normaliser l'email
    const normalizedEmail = email.toLowerCase().trim();
    console.log("Demande de connexion avec email normalisé:", normalizedEmail);
    
    // Vérification préliminaire pour voir si l'utilisateur est dans internal_users
    console.log("Vérification préliminaire dans internal_users");
    const { data: internalUsers, error: internalUserCheckError } = await supabase
      .from("internal_users")
      .select("id, email, is_active")
      .eq("email", normalizedEmail)
      .limit(1);
      
    console.log("Résultat de la vérification préliminaire:", internalUsers);
    
    if (internalUserCheckError) {
      console.error("Erreur lors de la vérification préliminaire:", internalUserCheckError.message);
      toast.error("Erreur de vérification utilisateur: " + internalUserCheckError.message);
      return { 
        success: false, 
        error: "Erreur de vérification: " + internalUserCheckError.message 
      };
    }
    
    // Si l'utilisateur n'est pas trouvé avec une recherche exacte, essayer avec ilike
    if (!internalUsers || internalUsers.length === 0) {
      console.log("Utilisateur non trouvé avec recherche exacte, tentative avec ilike:", normalizedEmail);
      const { data: fuzzyUsers, error: fuzzyError } = await supabase
        .from("internal_users")
        .select("id, email, is_active")
        .ilike("email", normalizedEmail)
        .limit(1);
        
      if (fuzzyError) {
        console.error("Erreur lors de la recherche flexible:", fuzzyError.message);
      }
      
      if (!fuzzyUsers || fuzzyUsers.length === 0) {
        console.error("Utilisateur non trouvé dans internal_users (même avec recherche flexible):", normalizedEmail);
        toast.error("Cet email n'est pas associé à un compte utilisateur interne");
        return { 
          success: false, 
          error: "Cet email n'est pas associé à un compte utilisateur interne" 
        };
      }
      
      // Utiliser le résultat de la recherche flexible
      if (fuzzyUsers && fuzzyUsers.length > 0) {
        const fuzzyUser = fuzzyUsers[0];
        console.log("Utilisateur trouvé avec recherche flexible:", fuzzyUser);
        
        if (!fuzzyUser.is_active) {
          console.error("Utilisateur désactivé:", fuzzyUser.email);
          toast.error("Ce compte a été désactivé");
          return {
            success: false,
            error: "Ce compte utilisateur a été désactivé. Contactez votre administrateur."
          };
        }
        
        console.log("Utilisateur trouvé et actif avec recherche flexible:", fuzzyUser.email);
      }
    } else {
      // Vérifier si l'utilisateur est actif
      const internalUser = internalUsers[0];
      if (!internalUser.is_active) {
        console.error("Utilisateur désactivé:", normalizedEmail);
        toast.error("Ce compte a été désactivé");
        return {
          success: false,
          error: "Ce compte utilisateur a été désactivé. Contactez votre administrateur."
        };
      }
      
      console.log("Utilisateur trouvé dans internal_users et actif:", internalUser);
    }
    
    // Vérification des identifiants avec Supabase Auth
    console.log("Tentative d'authentification avec Supabase pour:", normalizedEmail);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });
    
    if (authError) {
      console.error("Erreur d'authentification Supabase:", authError);
      
      if (authError.message.includes("Invalid login credentials")) {
        console.log("Identifiants invalides pour:", normalizedEmail);
        toast.error("Email ou mot de passe incorrect");
        return { 
          success: false, 
          error: "Email ou mot de passe incorrect" 
        };
      }
      
      toast.error("Erreur d'authentification: " + authError.message);
      return { 
        success: false, 
        error: authError.message || "Une erreur est survenue lors de la connexion" 
      };
    }
    
    if (!authData?.user) {
      console.error("Aucune donnée utilisateur retournée par l'authentification");
      toast.error("Erreur d'authentification");
      return {
        success: false,
        error: "Erreur d'authentification: aucune donnée utilisateur"
      };
    }
    
    console.log("Authentification réussie pour l'utilisateur:", normalizedEmail);
    toast.success("Connexion réussie");
    return { success: true };
    
  } catch (error: any) {
    console.error("Erreur de connexion:", error);
    toast.error("Erreur lors de la connexion");
    return { 
      success: false, 
      error: "Une erreur est survenue lors de la connexion: " + (error.message || "Erreur inconnue")
    };
  }
};
