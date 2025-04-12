
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
        // Extract password for potential auth signup (not implemented yet)
        const { password, ...userData } = user;
        
        // Create a base object with required fields, ensuring they aren't nullable
        const userDbObject = {
          id: crypto.randomUUID(),
          email: userData.email || '',
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          role: userData.role || 'employee',
          is_active: typeof userData.is_active === 'boolean' ? userData.is_active : true,
          phone: userData.phone || '',
          address: userData.address || '',
          photo_url: userData.photo_url || null
        };

        return userDbObject;
      });
      
      console.log("Inserting users:", usersForDb);
      
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
