
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { InternalUserTable } from "@/components/internal-users/InternalUserTable";
import { InternalUserForm } from "@/components/internal-users/InternalUserForm";
import { InternalUserHeader } from "@/components/internal-users/InternalUserHeader";
import { AuthorizationCheck } from "@/components/internal-users/AuthorizationCheck";
import { useInternalUsers } from "@/components/internal-users/useInternalUsers";

const InternalUsers = () => {
  const {
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
  } = useInternalUsers();

  return (
    <DashboardLayout>
      <AuthorizationCheck
        isAuthChecking={isAuthChecking}
        isAuthorized={isAuthorized}
      >
        <div className="p-8 space-y-8">
          <InternalUserHeader onAddClick={handleAddClick} />

          <InternalUserTable
            users={users}
            isLoading={isLoading}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onToggleStatus={toggleUserStatus}
            onAddUser={handleAddClick}
          />

          <InternalUserForm
            isOpen={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onSubmit={handleSubmit}
            selectedUser={selectedUser}
          />
        </div>
      </AuthorizationCheck>
    </DashboardLayout>
  );
};

export default InternalUsers;
