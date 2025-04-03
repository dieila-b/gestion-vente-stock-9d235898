
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
        // Update existing user
        success = await updateUser(values, selectedUser);
      } else {
        // Create new user
        const userId = await createUser(values);
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
