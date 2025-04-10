
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
  
  // Vérifier que l'utilisateur existe dans internal_users
  const { data: internalUsers, error: internalError } = await supabase
    .from('internal_users')
    .select('id, email, is_active')
    .ilike('email', normalizedEmail)
    .limit(1);
      
  if (internalError) {
    console.error("Erreur lors de la vérification dans internal_users:", internalError.message);
    return { isValid: false, isActive: false };
  }
  
  if (!internalUsers || internalUsers.length === 0) {
    console.error("Utilisateur non trouvé dans internal_users:", normalizedEmail);
    return { isValid: false, isActive: false };
  }
    
  // Vérifier si l'utilisateur est actif
  const internalUser = internalUsers[0];
  if (!internalUser.is_active) {
    console.error("L'utilisateur est désactivé:", normalizedEmail);
    return { isValid: true, isActive: false };
  }
  
  console.log("L'utilisateur est actif dans internal_users:", normalizedEmail);
  return { isValid: true, isActive: true };
};
