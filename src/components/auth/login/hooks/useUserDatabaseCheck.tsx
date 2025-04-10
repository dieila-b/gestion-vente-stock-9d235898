
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export function useUserDatabaseCheck(email: string, isDevelopmentMode: boolean, testingMode: boolean) {
  useEffect(() => {
    const checkUserExistsInDatabase = async () => {
      const normalizedEmail = email.toLowerCase().trim();
      console.log("Vérification initiale de l'existence de:", normalizedEmail);
      
      try {
        // Check internal_users
        const { data: internalUsers, error: internalError } = await supabase
          .from('internal_users')
          .select('id, email, is_active')
          .eq('email', normalizedEmail)
          .limit(1);
          
        if (internalError) {
          console.error("Erreur lors de la vérification initiale dans internal_users:", internalError);
          return;
        }
        
        if (!internalUsers || internalUsers.length === 0) {
          console.log("Utilisateur non trouvé avec eq dans internal_users, tentative avec ilike");
          
          const { data: fuzzyUsers, error: fuzzyError } = await supabase
            .from('internal_users')
            .select('id, email, is_active')
            .ilike('email', normalizedEmail)
            .limit(1);
            
          if (fuzzyError) {
            console.error("Erreur lors de la recherche flexible:", fuzzyError);
            return;
          }
          
          if (fuzzyUsers && fuzzyUsers.length > 0) {
            console.log("Utilisateur trouvé avec ilike:", fuzzyUsers[0]);
          } else {
            console.error("ATTENTION: L'utilisateur", normalizedEmail, "n'existe pas dans internal_users");
          }
        } else {
          console.log("Utilisateur trouvé dans internal_users:", internalUsers[0]);
        }
        
        // Check auth.users via Supabase Auth
        try {
          const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
          
          if (authError) {
            console.error("Erreur lors de la vérification dans auth.users:", authError);
            return;
          }
          
          // Fix TypeScript error by properly typing the users array
          if (authData && authData.users) {
            // Explicitly cast users to any array first, then map to correct type
            const users = Array.isArray(authData.users) ? authData.users as any[] : [];
            
            const authUser = users.find(u => 
              u && typeof u === 'object' && 'email' in u && 
              typeof u.email === 'string' && u.email.toLowerCase() === normalizedEmail
            );
            
            if (authUser) {
              console.log("Utilisateur trouvé dans auth.users:", authUser.email);
            } else {
              console.error("ATTENTION: L'utilisateur", normalizedEmail, "n'existe pas dans auth.users");
            }
          }
        } catch (authListError) {
          console.error("Erreur lors de la liste des utilisateurs auth:", authListError);
        }
        
      } catch (error) {
        console.error("Erreur lors de la vérification initiale:", error);
      }
    };
    
    if (!isDevelopmentMode && !testingMode) {
      checkUserExistsInDatabase();
    }
  }, [email, isDevelopmentMode, testingMode]);
}
