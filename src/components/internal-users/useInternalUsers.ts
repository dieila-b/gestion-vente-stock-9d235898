
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
  const isDevelopmentMode = import.meta.env.DEV;
  
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

  // Load users when authorized or in development mode
  useEffect(() => {
    if (isDevelopmentMode || isAuthorized) {
      console.log(isDevelopmentMode 
        ? "Development mode: Authentication disabled, fetching users regardless of auth status" 
        : "User is authorized, fetching users");
      fetchUsers();
    }
  }, [isAuthorized, fetchUsers, isDevelopmentMode]);

  // Form submission handler - define all callbacks at the top level, not conditionally
  const handleSubmit = useCallback(async (values: UserFormValues): Promise<void> => {
    console.log("Form submitted with values:", values);
    await submitUserAction(values, selectedUser);
    // Close dialog after submission
    setIsAddDialogOpen(false);
  }, [submitUserAction, selectedUser, setIsAddDialogOpen]);

  // Add user handler - memoized to avoid recreations
  const handleAddClick = useCallback(() => {
    setSelectedUser(null);
    setIsAddDialogOpen(true);
  }, [setSelectedUser, setIsAddDialogOpen]);

  // Edit user handler - memoized to avoid recreations
  const handleEditClick = useCallback((user: InternalUser) => {
    setSelectedUser(user);
    setIsAddDialogOpen(true);
  }, [setSelectedUser, setIsAddDialogOpen]);

  return {
    users,
    isLoading,
    isAuthChecking: isDevelopmentMode ? false : isAuthChecking,
    isAuthorized: isDevelopmentMode ? true : isAuthorized,
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
