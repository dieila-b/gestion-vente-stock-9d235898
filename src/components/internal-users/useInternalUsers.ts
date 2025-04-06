
import { useEffect, useCallback, useState } from "react";
import { InternalUser } from "@/types/internal-user";
import { UserFormValues } from "./validation/user-form-schema";
import { useAuth } from "./hooks/useAuth";
import { useUserData } from "./hooks/userData";
import { useUserFormState } from "./hooks/useUserForm";
import { useUserActions } from "./hooks/useUserActions";

export const useInternalUsers = () => {
  // Get authentication status
  const { isAuthChecking, isAuthorized } = useAuth();
  
  // Get user data and actions
  const { users, isLoading, fetchUsers, addUser, updateUserInList } = useUserData();
  
  // Dialog state management
  const { isAddDialogOpen, selectedUser, setIsAddDialogOpen, setSelectedUser } = useUserFormState();
  
  // User actions (submit, delete, toggle status)
  const userActions = useUserActions(fetchUsers, addUser, updateUserInList);
  const { handleSubmit: submitUserAction, handleDelete, toggleUserStatus } = userActions;

  // Debug logging for component state
  useEffect(() => {
    console.log("useInternalUsers: Current auth status - isAuthorized:", isAuthorized, "isAuthChecking:", isAuthChecking);
    console.log("useInternalUsers: Current user data - users:", users, "isLoading:", isLoading);
  }, [isAuthorized, isAuthChecking, users, isLoading]);

  // Load users when authorized
  useEffect(() => {
    if (isAuthorized) {
      console.log("User is authorized, fetching users");
      fetchUsers();
    }
  }, [isAuthorized, fetchUsers]);

  // Form submission handler
  const handleSubmit = useCallback(async (values: UserFormValues): Promise<void> => {
    console.log("Form submitted with values:", values);
    await submitUserAction(values, selectedUser);
    // Close dialog after submission
    setIsAddDialogOpen(false);
  }, [submitUserAction, selectedUser, setIsAddDialogOpen]);

  // Add user handler
  const handleAddClick = useCallback(() => {
    setSelectedUser(null);
    setIsAddDialogOpen(true);
  }, [setSelectedUser, setIsAddDialogOpen]);

  // Edit user handler
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
