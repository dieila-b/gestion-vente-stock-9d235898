
import { supabase } from "@/integrations/supabase/client";

/**
 * Verifies if the user exists in internal_users table and is active
 */
export const verifyInternalUser = async (userEmail: string): Promise<{ isValid: boolean; isActive: boolean }> => {
  if (!userEmail) {
    console.error("User session has no email");
    return { isValid: false, isActive: false };
  }
  
  const normalizedEmail = userEmail.toLowerCase().trim();
  
  // Verify that user exists in internal_users
  const { data: internalUsers, error: internalError } = await supabase
    .from('internal_users')
    .select('id, email, is_active')
    .ilike('email', normalizedEmail)
    .limit(1);
      
  if (internalError) {
    console.error("Error checking internal_users:", internalError.message);
    return { isValid: false, isActive: false };
  }
  
  if (!internalUsers || internalUsers.length === 0) {
    console.error("User not found in internal_users:", normalizedEmail);
    return { isValid: false, isActive: false };
  }
    
  // Check if user is active
  const internalUser = internalUsers[0];
  if (!internalUser.is_active) {
    console.error("User is deactivated:", normalizedEmail);
    return { isValid: true, isActive: false };
  }
  
  console.log("User is active in internal_users:", normalizedEmail);
  return { isValid: true, isActive: true };
};
