
import { useInternalUserData } from "./use-internal-user-data";
import { useInternalUserDialog } from "./use-internal-user-dialog";
import { useInternalUserMutations } from "./use-internal-user-mutations";

export const useInternalUsers = () => {
  const {
    users,
    isLoading,
    error,
    refetch,
    getRoleBadgeColor,
  } = useInternalUserData();

  const {
    isAddDialogOpen,
    setIsAddDialogOpen,
    selectedUser,
    setSelectedUser,
    activeTab,
    setActiveTab,
    securitySettings,
    setSecuritySettings,
    handleDialogOpen,
  } = useInternalUserDialog();

  const {
    handleCreateUser: createUser,
    handleUpdateUser: updateUser,
    handleDelete,
    handleResetPassword,
  } = useInternalUserMutations(refetch);

  // Wrapper functions to close dialog and reset selection after operations
  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    const success = await createUser(e);
    if (success) {
      setIsAddDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    const success = await updateUser(e, selectedUser);
    if (success) {
      setIsAddDialogOpen(false);
      setSelectedUser(null);
    }
  };

  return {
    users,
    isLoading,
    error,
    isAddDialogOpen,
    setIsAddDialogOpen,
    selectedUser,
    setSelectedUser,
    activeTab,
    setActiveTab,
    securitySettings,
    setSecuritySettings,
    handleCreateUser,
    handleUpdateUser,
    handleDelete,
    handleResetPassword,
    handleDialogOpen,
    getRoleBadgeColor,
  };
};
