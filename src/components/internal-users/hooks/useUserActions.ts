
import { InternalUser } from "@/types/internal-user";
import { UserFormValues } from "../validation/user-form-schema";
import { toast } from "@/hooks/use-toast";
import { 
  createUser, 
  updateUser, 
  deleteUser,
  toggleUserStatus 
} from "./user-actions";

export const useUserActions = (
  fetchUsers: () => Promise<void>,
  addUser: (user: InternalUser) => void,
  updateUserInList: (user: InternalUser) => void
) => {
  
  const handleSubmit = async (values: UserFormValues, selectedUser: InternalUser | null): Promise<void> => {
    try {
      if (selectedUser) {
        // Update existing user with appropriate casting to match expected types
        const updatedUser = await updateUser({
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          phone: values.phone || "",
          address: values.address || "",
          role: values.role,
          is_active: values.is_active !== undefined ? values.is_active : true,
          password: values.password
        }, selectedUser);

        if (updatedUser) {
          console.log("User updated successfully:", updatedUser);
          // Update the user locally
          updateUserInList(updatedUser);
          toast({
            title: "Succès",
            description: "Utilisateur mis à jour avec succès",
          });
        }
      } else {
        // Create new user with appropriate casting to match expected types
        if (!values.password) {
          toast({
            title: "Erreur",
            description: "Le mot de passe est requis pour créer un nouvel utilisateur",
            variant: "destructive",
          });
          return;
        }
        
        const newUser = await createUser({
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          password: values.password,
          phone: values.phone || "",
          address: values.address || "",
          role: values.role,
          is_active: values.is_active !== undefined ? values.is_active : true
        });

        if (newUser) {
          console.log("New user created:", newUser);
          // Add the new user to local state
          addUser(newUser);
          toast({
            title: "Succès",
            description: "Nouvel utilisateur créé avec succès",
          });
        }
      }
    } catch (error: any) {
      console.error("Error submitting user:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de l'opération",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (user: InternalUser) => {
    try {
      const success = await deleteUser(user);
      if (success) {
        await fetchUsers();
        toast({
          title: "Succès",
          description: "Utilisateur supprimé avec succès",
        });
      }
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de la suppression",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (user: InternalUser) => {
    try {
      const success = await toggleUserStatus(user);
      if (success) {
        // Instead of refetching, update the user locally
        const updatedUser = { ...user, is_active: !user.is_active };
        updateUserInList(updatedUser);
        
        toast({
          title: "Succès",
          description: `Utilisateur ${user.is_active ? 'désactivé' : 'activé'} avec succès`,
        });
      }
    } catch (error: any) {
      console.error("Error toggling user status:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors du changement de statut",
        variant: "destructive",
      });
    }
  };

  return {
    handleSubmit,
    handleDelete,
    toggleUserStatus: handleToggleStatus
  };
};
