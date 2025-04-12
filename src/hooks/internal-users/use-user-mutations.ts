
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/user";
import { QueryClient } from "@tanstack/react-query";

export const useUserMutations = (queryClient: QueryClient) => {
  const handleBulkInsert = async (
    users: Omit<User, 'id'>[],
    validatePasswords: () => boolean,
    validateRequiredFields: () => boolean,
    resetFormState: () => void
  ) => {
    if (users.length === 0) {
      toast.error("Aucun utilisateur à ajouter");
      return;
    }
    
    // Validate passwords and required fields
    if (!validatePasswords() || !validateRequiredFields()) {
      return;
    }
    
    try {
      // Show loading toast
      toast.loading("Enregistrement des utilisateurs en cours...");
      
      // Transform users to match the database schema
      const usersForDb = users.map(user => {
        // Remove password field as it's not stored in the database table
        const { password, ...userData } = user;
        
        // Generate UUID for the user
        const userWithId = {
          ...userData,
          id: crypto.randomUUID(),
          // Ensure email exists - required by database
          email: userData.email || ''
        };
        
        return userWithId;
      });
      
      console.log("Inserting users:", usersForDb);
      
      // TypeScript now knows our array contains the required properties
      const { error } = await supabase
        .from('internal_users')
        .insert(usersForDb);
      
      if (error) {
        console.error("Error adding users:", error);
        toast.dismiss();
        toast.error(`Erreur lors de l'ajout des utilisateurs: ${error.message}`);
        return;
      }
      
      toast.dismiss();
      toast.success("Utilisateurs ajoutés avec succès");
      await queryClient.refetchQueries({ queryKey: ['internal-users'] });
      resetFormState();
    } catch (error: any) {
      console.error("Exception adding users:", error);
      toast.dismiss();
      toast.error(`Exception lors de l'ajout des utilisateurs: ${error.message || error}`);
    }
  };

  return { handleBulkInsert };
};
