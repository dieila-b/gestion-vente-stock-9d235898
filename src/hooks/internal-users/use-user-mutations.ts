
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
      
      // Add UUIDs for each new user and filter out fields that might not exist in the database
      const usersWithIds = users.map(user => {
        // Create a copy of the user without fields that might cause issues
        const { password, ...safeUserData } = user;
        
        // Create a base user object with a generated ID
        const userWithId: Record<string, any> = {
          ...safeUserData,
          id: crypto.randomUUID() // Generate a UUID for each user
        };
        
        // Only add photo_url if it has a value
        if (user.photo_url) {
          userWithId.photo_url = user.photo_url;
        }
        
        return userWithId;
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
