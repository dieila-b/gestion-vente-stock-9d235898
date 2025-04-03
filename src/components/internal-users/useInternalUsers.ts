
import { useEffect, useCallback, useMemo } from "react";
import { InternalUser } from "@/types/internal-user";
import { UserFormValues } from "./validation/user-form-schema";
import { useAuth } from "./hooks/useAuth";
import { useUserData } from "./hooks/useUserData";
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

  // Load users when authorized, but only once
  useEffect(() => {
    if (isAuthorized && !isLoading) {
      console.log("Fetching users because authorized");
      fetchUsers();
    }
    // Do not include fetchUsers in dependency array to prevent infinite loops
  }, [isAuthorized, isLoading]); 

  // Form submission handler - memoized to prevent recreation
  const handleSubmit = useCallback(async (values: UserFormValues): Promise<void> => {
    await submitUserAction(values, selectedUser);
    // Close dialog after submission
    setIsAddDialogOpen(false);
  }, [submitUserAction, selectedUser, setIsAddDialogOpen]);

  // Add user handler - memoized to prevent recreation
  const handleAddClick = useCallback(() => {
    setSelectedUser(null);
    setIsAddDialogOpen(true);
  }, [setSelectedUser, setIsAddDialogOpen]);

  // Edit user handler - memoized to prevent recreation
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
