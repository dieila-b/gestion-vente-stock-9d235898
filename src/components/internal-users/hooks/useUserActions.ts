
import { InternalUser } from "@/types/internal-user";
import { UserFormValues } from "../validation/user-form-schema";
import { toast } from "@/hooks/use-toast";
import { 
  createUser, 
  updateUser, 
  deleteUser,
  toggleUserStatus 
} from "./user-actions";

export const useUserActions = (fetchUsers: () => Promise<void>) => {
  
  const handleSubmit = async (values: UserFormValues, selectedUser: InternalUser | null): Promise<void> => {
    try {
      let success = false;
      
      if (selectedUser) {
        // Update existing user with appropriate casting to match expected types
        success = await updateUser({
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          phone: values.phone || "",
          address: values.address || "",
          role: values.role,
          is_active: values.is_active !== undefined ? values.is_active : true,
          force_password_change: values.force_password_change !== undefined ? values.force_password_change : true,
          password: values.password
        }, selectedUser);
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
        
        const userId = await createUser({
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          password: values.password,
          phone: values.phone || "",
          address: values.address || "",
          role: values.role,
          is_active: values.is_active !== undefined ? values.is_active : true,
          force_password_change: values.force_password_change !== undefined ? values.force_password_change : true
        });
        success = !!userId;
      }

      // Only refresh the users list if operation was successful
      if (success) {
        await fetchUsers();
      }
    } catch (error: any) {
      console.error("Error submitting user:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'opération",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (user: InternalUser) => {
    const success = await deleteUser(user);
    if (success) {
      await fetchUsers();
    }
  };

  const handleToggleStatus = async (user: InternalUser) => {
    const success = await toggleUserStatus(user);
    if (success) {
      await fetchUsers();
    }
  };

  return {
    handleSubmit,
    handleDelete,
    toggleUserStatus: handleToggleStatus
  };
};
