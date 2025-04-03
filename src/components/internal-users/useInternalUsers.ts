
import { useEffect, useCallback } from "react";
import { InternalUser } from "@/types/internal-user";
import { UserFormValues } from "./validation/user-form-schema";
import { useAuth } from "./hooks/useAuth";
import { useUserData } from "./hooks/useUserData";
import { useUserFormState } from "./hooks/useUserForm";
import { useUserActions } from "./hooks/useUserActions";

export const useInternalUsers = () => {
  const { isAuthChecking, isAuthorized } = useAuth();
  const { users, isLoading, fetchUsers, addUser, updateUserInList } = useUserData();
  const { isAddDialogOpen, selectedUser, setIsAddDialogOpen, setSelectedUser } = useUserFormState();
  const { handleSubmit: submitUserAction, handleDelete, toggleUserStatus } = useUserActions(
    fetchUsers,
    addUser,
    updateUserInList
  );

  // Load users when authorized, but only once
  useEffect(() => {
    if (isAuthorized && !isLoading) {
      console.log("Fetching users because authorized");
      fetchUsers();
    }
    // Removed fetchUsers from dependency array to prevent infinite loops
  }, [isAuthorized, isLoading]); 

  const handleSubmit = async (values: UserFormValues): Promise<void> => {
    await submitUserAction(values, selectedUser);
    // Close dialog after submission
    setIsAddDialogOpen(false);
  };

  const handleAddClick = useCallback(() => {
    setSelectedUser(null);
    setIsAddDialogOpen(true);
  }, [setSelectedUser, setIsAddDialogOpen]);

  const handleEditClick = useCallback((user: InternalUser) => {
    setSelectedUser(user);
    setIsAddDialogOpen(true);
  }, [setSelectedUser, setIsAddDialogOpen]);

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
