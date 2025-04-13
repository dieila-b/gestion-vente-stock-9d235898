
import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { User } from "@/types/user";
import { getUserColumns } from "./table/UserTableColumns";
import { UserEditDialog } from "./UserEditDialog";

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  onDeleteUser?: (userId: string) => void;
  onEditUser?: (user: User) => void;
}

export const UsersTable = ({ users, isLoading, onDeleteUser, onEditUser }: UsersTableProps) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleEditComplete = (updatedUser: User) => {
    if (onEditUser) {
      onEditUser(updatedUser);
    }
    setIsEditDialogOpen(false);
  };

  const columns = getUserColumns({
    onEditUser: handleEditClick,
    onDeleteUser
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Liste des Utilisateurs</h2>
      <DataTable
        columns={columns}
        data={users}
        searchColumn="email"
        searchPlaceholder="Rechercher par email..."
      />
      
      {selectedUser && (
        <UserEditDialog
          user={selectedUser}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleEditComplete}
        />
      )}
    </div>
  );
};
