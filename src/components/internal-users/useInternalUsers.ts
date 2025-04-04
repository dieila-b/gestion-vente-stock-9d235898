
import { useState } from "react";
import { InternalUser } from "@/types/internal-user";
import { useUserData } from "./hooks/useUserData";
import { useUserActions } from "./hooks/useUserActions";
import { useAuth } from "./hooks/useAuth";
import { UserFormValues } from "./validation/user-form-schema";
import { toast } from "sonner";

export const useInternalUsers = () => {
  const { users, isLoading, fetchUsers, addUser, updateUserInList } = useUserData();
  const { handleSubmit: userActionsSubmit, handleDelete: userActionsDelete, toggleUserStatus } = useUserActions(
    fetchUsers,
    addUser,
    updateUserInList
  );
  const { isAuthChecking, isAuthorized } = useAuth();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<InternalUser | null>(null);

  const handleAddClick = () => {
    setSelectedUser(null);
    setIsAddDialogOpen(true);
  };

  const handleEditClick = (user: InternalUser) => {
    setSelectedUser(user);
    setIsAddDialogOpen(true);
  };

  const handleSubmit = async (data: UserFormValues) => {
    try {
      await userActionsSubmit(data, selectedUser);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error);
      toast.error("Erreur lors de l'enregistrement de l'utilisateur");
    }
  };

  const handleDelete = async (user: InternalUser) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.first_name} ${user.last_name}?`)) {
      try {
        await userActionsDelete(user);
        toast.success("Utilisateur supprimé avec succès");
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        toast.error("Erreur lors de la suppression de l'utilisateur");
      }
    }
  };

  return {
    users,
    isLoading,
    isAuthChecking,
    isAuthorized,
    isAddDialogOpen,
    selectedUser,
    setIsAddDialogOpen,
    handleSubmit,
    handleDelete,
    toggleUserStatus,
    handleAddClick,
    handleEditClick
  };
};
