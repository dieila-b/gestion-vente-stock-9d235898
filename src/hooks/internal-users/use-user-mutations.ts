
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
        return {
          // Removed the explicit ID assignment to let the database generate it
          email: userData.email || '',
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          role: userData.role || 'employee',
          is_active: typeof userData.is_active === 'boolean' ? userData.is_active : true,
          phone: userData.phone || '',
          address: userData.address || '',
          photo_url: userData.photo_url || null,
          password: password || '' // Store password in the database (in a real application, this should be hashed)
        };
      });
      
      console.log("Inserting users:", usersForDb);
      
      const { error, data } = await supabase
        .from('internal_users')
        .insert(usersForDb)
        .select();
      
      if (error) {
        console.error("Error adding users:", error);
        toast.dismiss();
        toast.error(`Erreur lors de l'ajout des utilisateurs: ${error.message}`);
        return;
      }
      
      console.log("Users added successfully:", data);
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

  const handleDeleteUser = async (userId: string) => {
    try {
      toast.loading("Suppression de l'utilisateur en cours...");
      
      const { error } = await supabase
        .from('internal_users')
        .delete()
        .eq('id', userId);
      
      if (error) {
        toast.dismiss();
        toast.error(`Erreur lors de la suppression de l'utilisateur: ${error.message}`);
        return false;
      }
      
      toast.dismiss();
      toast.success("Utilisateur supprimé avec succès");
      await queryClient.refetchQueries({ queryKey: ['internal-users'] });
      return true;
    } catch (error: any) {
      console.error("Exception lors de la suppression de l'utilisateur:", error);
      toast.dismiss();
      toast.error(`Exception lors de la suppression de l'utilisateur: ${error.message || error}`);
      return false;
    }
  };

  const handleUpdateUser = async (user: User) => {
    try {
      toast.loading("Mise à jour de l'utilisateur en cours...");
      
      const { error } = await supabase
        .from('internal_users')
        .update({
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          is_active: user.is_active,
          // Ne pas mettre à jour le mot de passe ici, cela nécessiterait une logique spécifique
        })
        .eq('id', user.id);
      
      if (error) {
        toast.dismiss();
        toast.error(`Erreur lors de la mise à jour de l'utilisateur: ${error.message}`);
        return false;
      }
      
      toast.dismiss();
      toast.success("Utilisateur mis à jour avec succès");
      await queryClient.refetchQueries({ queryKey: ['internal-users'] });
      return true;
    } catch (error: any) {
      console.error("Exception lors de la mise à jour de l'utilisateur:", error);
      toast.dismiss();
      toast.error(`Exception lors de la mise à jour de l'utilisateur: ${error.message || error}`);
      return false;
    }
  };

  return { handleBulkInsert, handleDeleteUser, handleUpdateUser };
};
