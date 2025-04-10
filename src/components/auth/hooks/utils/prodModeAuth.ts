
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
    
    // Vérifier d'abord si l'utilisateur existe dans internal_users
    console.log("Vérification de l'utilisateur dans internal_users:", normalizedEmail);
    const { data: internalUsers, error: internalUserError } = await supabase
      .from("internal_users")
      .select("email, is_active")
      .ilike("email", normalizedEmail)
      .limit(1);
      
    // Log de débogage pour la requête
    console.log("Résultat de la requête:", internalUsers ? JSON.stringify(internalUsers) : "null", 
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
      
      // Tentative de requête directe pour vérifier si la table existe et a des données
      const { data: allUsers, error: allUsersError } = await supabase
        .from("internal_users")
        .select("email")
        .limit(5);
        
      console.log("Vérification des données dans la table:", 
                  allUsers ? `${allUsers.length} utilisateurs trouvés` : "aucun utilisateur", 
                  "Erreur:", allUsersError ? allUsersError.message : "aucune");
      
      toast.error("Email non reconnu");
      return { 
        success: false, 
        error: "Cet email n'est pas associé à un compte utilisateur interne" 
      };
    }
    
    const internalUserByEmail = internalUsers[0];
    
    // Vérifier si l'utilisateur est actif
    if (internalUserByEmail && !internalUserByEmail.is_active) {
      console.error("L'utilisateur existe mais est désactivé:", normalizedEmail);
      toast.error("Compte désactivé");
      return {
        success: false,
        error: "Ce compte utilisateur a été désactivé. Contactez votre administrateur."
      };
    }
    
    // Une fois vérifié dans internal_users, procéder à l'authentification avec Supabase
    console.log("Utilisateur trouvé et actif, tentative d'authentification avec Supabase pour:", normalizedEmail);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });
    
    if (authError) {
      console.error("Erreur d'authentification:", authError);
      
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
