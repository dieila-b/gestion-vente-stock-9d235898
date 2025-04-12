
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
      
      // Add UUIDs for each new user and remove password field for database storage
      const usersWithIds = users.map(user => {
        // Create a copy of the user without the password field
        const { password, ...userWithoutPassword } = user;
        return {
          ...userWithoutPassword,
          id: crypto.randomUUID() // Generate a UUID for each user
        };
      });
      
      console.log("Inserting users:", usersWithIds);
      
      const { data, error } = await supabase
        .from('internal_users')
        .insert(usersWithIds);
      
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
