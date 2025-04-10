
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
      
      toast.error("Erreur d'authentification");
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
    
    // Maintenant, vérifier si l'utilisateur est dans la table internal_users et actif
    console.log("Vérification si l'utilisateur est un utilisateur interne:", normalizedEmail);
    const { data: internalUsers, error: internalUserError } = await supabase
      .from("internal_users")
      .select("email, is_active")
      .ilike("email", normalizedEmail)
      .limit(1);
      
    // Log de débogage pour la requête
    console.log("Résultat de la requête internal_users:", internalUsers ? JSON.stringify(internalUsers) : "null", 
                "Erreur:", internalUserError ? internalUserError.message : "aucune");
      
    if (internalUserError) {
      console.error("Erreur lors de la vérification internal_users:", internalUserError.message);
      toast.error("Erreur lors de la vérification du compte");
      return { 
        success: false, 
        error: "Erreur lors de la vérification du compte: " + internalUserError.message
      };
    }
    
    // Si aucun utilisateur trouvé dans internal_users
    if (!internalUsers || internalUsers.length === 0) {
      console.error("Utilisateur non trouvé dans la table internal_users:", normalizedEmail);
      
      // Déconnexion pour éviter un état d'authentification incohérent
      await supabase.auth.signOut();
      
      toast.error("Cet email n'est pas associé à un compte utilisateur interne");
      return { 
        success: false, 
        error: "Cet email n'est pas associé à un compte utilisateur interne" 
      };
    }
    
    const internalUserByEmail = internalUsers[0];
    
    // Vérifier si l'utilisateur est actif
    if (internalUserByEmail && !internalUserByEmail.is_active) {
      console.error("L'utilisateur existe mais est désactivé:", normalizedEmail);
      
      // Déconnexion pour éviter un état d'authentification incohérent
      await supabase.auth.signOut();
      
      toast.error("Ce compte a été désactivé");
      return {
        success: false,
        error: "Ce compte utilisateur a été désactivé. Contactez votre administrateur."
      };
    }
    
    console.log("Authentification réussie pour l'utilisateur interne:", normalizedEmail);
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
