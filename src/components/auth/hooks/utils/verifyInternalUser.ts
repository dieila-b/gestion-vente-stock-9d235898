
import { supabase } from "@/integrations/supabase/client";

/**
 * Verifies if a user exists in the internal_users table
 * @param user The authenticated user from Supabase
 * @returns The internal user if found, null otherwise
 */
export const verifyInternalUser = async (user: any) => {
  // First try to find by email
  let internalUser = null;
  
  if (user.email) {
    console.log("Looking up internal user by email:", user.email);
    const { data: emailUser, error: emailError } = await supabase
      .from('internal_users')
      .select('id, email, is_active, role')
      .eq('email', user.email.toLowerCase())
      .maybeSingle();
    
    if (!emailError && emailUser) {
      console.log("User found by email:", emailUser);
      internalUser = emailUser;
    } else {
      console.log("User not found by email, error:", emailError?.message || "No user found");
    }
  }
  
  // If not found by email, try by ID
  if (!internalUser) {
    console.log("Looking up internal user by ID:", user.id);
    const { data: idUser, error: idError } = await supabase
      .from('internal_users')
      .select('id, email, is_active, role')
      .eq('id', user.id)
      .maybeSingle();
    
    if (!idError && idUser) {
      console.log("User found by ID:", idUser);
      internalUser = idUser;
    } else {
      console.log("User not found by ID, error:", idError?.message || "No user found");
    }
  }
  
  return internalUser;
};
