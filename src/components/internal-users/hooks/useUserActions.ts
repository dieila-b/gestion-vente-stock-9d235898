
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

        if (updatedUser && updateUserInList) {
          // Mettre à jour localement l'utilisateur
          updateUserInList(updatedUser);
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

        if (newUser && addUser) {
          console.log("Ajout d'un nouvel utilisateur à la liste:", newUser);
          addUser(newUser);
        }
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
