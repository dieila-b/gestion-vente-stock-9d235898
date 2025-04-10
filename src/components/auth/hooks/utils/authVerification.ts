
import { supabase } from "@/integrations/supabase/client";

/**
 * Vérifie si l'utilisateur existe dans la table internal_users et est actif
 */
export const verifyInternalUser = async (userEmail: string): Promise<{ isValid: boolean; isActive: boolean }> => {
  if (!userEmail) {
    console.error("La session utilisateur n'a pas d'email");
    return { isValid: false, isActive: false };
  }
  
  const normalizedEmail = userEmail.toLowerCase().trim();
  console.log("Vérification de l'utilisateur interne:", normalizedEmail);
  
  try {
    // Récupérer la session actuelle pour vérification
    const { data: sessionData } = await supabase.auth.getSession();
    const isSessionActive = !!sessionData.session;
    console.log("État de la session:", isSessionActive ? "Active" : "Inactive");

    // Vérifier que l'utilisateur existe dans internal_users
    const { data: internalUsers, error: internalError } = await supabase
      .from('internal_users')
      .select('id, email, is_active')
      .eq('email', normalizedEmail)
      .limit(1);
    
    // Log complet de la requête et de la réponse pour débogage
    console.log("Requête de vérification:", {
      table: 'internal_users',
      email: normalizedEmail,
      query: 'eq'
    });
    
    console.log("Réponse brute:", internalUsers);
        
    if (internalError) {
      console.error("Erreur lors de la vérification dans internal_users:", internalError.message);
      return { isValid: false, isActive: false };
    }
    
    if (!internalUsers || internalUsers.length === 0) {
      console.error("Utilisateur non trouvé dans internal_users:", normalizedEmail);
      
      // Essayer avec ilike pour être plus flexible
      const { data: fuzzyUsers, error: fuzzyError } = await supabase
        .from('internal_users')
        .select('id, email, is_active')
        .ilike('email', normalizedEmail)
        .limit(1);
        
      if (fuzzyError) {
        console.error("Erreur lors de la recherche flexible:", fuzzyError.message);
        return { isValid: false, isActive: false };
      }
      
      if (fuzzyUsers && fuzzyUsers.length > 0) {
        console.log("Utilisateur trouvé avec recherche flexible:", fuzzyUsers[0]);
        const fuzzyUser = fuzzyUsers[0];
        
        if (!fuzzyUser.is_active) {
          console.error("L'utilisateur est désactivé:", fuzzyUser.email);
          return { isValid: true, isActive: false };
        }
        
        console.log("L'utilisateur est valide et actif (recherche flexible):", fuzzyUser.email);
        return { isValid: true, isActive: true };
      }
      
      return { isValid: false, isActive: false };
    }
      
    // Vérifier si l'utilisateur est actif
    const internalUser = internalUsers[0];
    console.log("Utilisateur trouvé dans internal_users:", internalUser);
    
    if (!internalUser.is_active) {
      console.error("L'utilisateur est désactivé:", normalizedEmail);
      return { isValid: true, isActive: false };
    }
    
    console.log("L'utilisateur est valide et actif dans internal_users:", normalizedEmail);
    return { isValid: true, isActive: true };
  } catch (error) {
    console.error("Erreur lors de la vérification de l'utilisateur:", error);
    return { isValid: false, isActive: false };
  }
};
