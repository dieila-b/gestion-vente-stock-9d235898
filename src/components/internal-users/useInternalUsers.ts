
import { useState } from "react";
import { InternalUser } from "@/types/internal-user";
import { useUserData } from "./hooks/useUserData";
import { useUserActions } from "./hooks/useUserActions";
import { useAuth } from "./hooks/useAuth";
import { UserFormValues } from "./validation/user-form-schema";
import { toast } from "sonner";

export const useInternalUsers = () => {
  const { users, isLoading, fetchUsers, addUser, updateUserInList } = useUserData();
  const { createUser, updateUser, deleteUser, toggleUserStatus } = useUserActions();
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
      if (selectedUser) {
        // Mise à jour d'un utilisateur existant
        console.log("Mise à jour de l'utilisateur:", data);
        const updatedUser = await updateUser(selectedUser.id, data);
        updateUserInList(updatedUser);
        toast.success("Utilisateur mis à jour avec succès");
      } else {
        // Création d'un nouvel utilisateur
        console.log("Création d'un nouvel utilisateur:", data);
        const newUser = await createUser(data);
        addUser(newUser);
        toast.success("Utilisateur créé avec succès");
      }
      
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error);
      toast.error("Erreur lors de l'enregistrement de l'utilisateur");
    }
  };

  const handleDelete = async (user: InternalUser) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.first_name} ${user.last_name}?`)) {
      try {
        await deleteUser(user.id);
        fetchUsers(); // Actualiser la liste
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
