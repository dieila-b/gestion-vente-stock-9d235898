
import { useEffect } from "react";
import { InternalUser } from "@/types/internal-user";
import { UserFormValues } from "./validation/user-form-schema";
import { useAuth } from "./hooks/useAuth";
import { useUserData } from "./hooks/useUserData";
import { useUserForm } from "./hooks/useUserForm";
import { useUserActions } from "./hooks/useUserActions";

export const useInternalUsers = () => {
  const { isAuthChecking, isAuthorized } = useAuth();
  const { users, isLoading, fetchUsers, addUser, updateUserInList } = useUserData();
  const { isAddDialogOpen, selectedUser, setIsAddDialogOpen, setSelectedUser } = useUserForm();
  const { handleSubmit: submitUserAction, handleDelete, toggleUserStatus } = useUserActions(
    fetchUsers,
    addUser,
    updateUserInList
  );

  // Load users when authorized
  useEffect(() => {
    if (isAuthorized) {
      fetchUsers();
    }
  }, [isAuthorized, fetchUsers]);

  const handleSubmit = async (values: UserFormValues): Promise<void> => {
    await submitUserAction(values, selectedUser);
    // Fermer la boîte de dialogue après la soumission
    setIsAddDialogOpen(false);
  };

  const handleAddClick = () => {
    setSelectedUser(null);
    setIsAddDialogOpen(true);
  };

  const handleEditClick = (user: InternalUser) => {
    setSelectedUser(user);
    setIsAddDialogOpen(true);
  };

  return {
    users,
    isLoading,
    isAuthChecking,
    isAuthorized,
    isAddDialogOpen,
    selectedUser,
    setIsAddDialogOpen,
    setSelectedUser,
    handleSubmit,
    handleDelete,
    toggleUserStatus,
    handleAddClick,
    handleEditClick
  };
};
