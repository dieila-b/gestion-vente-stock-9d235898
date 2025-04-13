
import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/types/user";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { UserAvatar } from "./UserAvatar";
import { UserRoleBadge } from "./UserRoleBadge";
import { UserStatusBadge } from "./UserStatusBadge";
import { UserTableActions } from "./UserTableActions";

interface GetUserColumnsProps {
  onEditUser?: (user: User) => void;
  onDeleteUser?: (userId: string) => void;
}

export const getUserColumns = ({ onEditUser, onDeleteUser }: GetUserColumnsProps): ColumnDef<User>[] => {
  return [
    {
      accessorKey: "photo_url",
      header: "Photo",
      cell: ({ row }) => {
        const photoUrl = row.getValue("photo_url") as string | undefined;
        const firstName = row.getValue("first_name") as string;
        const lastName = row.getValue("last_name") as string;
        
        return (
          <UserAvatar 
            photoUrl={photoUrl} 
            firstName={firstName} 
            lastName={lastName} 
          />
        );
      },
    },
    {
      accessorKey: "first_name",
      header: "Prénom",
    },
    {
      accessorKey: "last_name",
      header: "Nom",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Téléphone",
    },
    {
      accessorKey: "role",
      header: "Rôle",
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return <UserRoleBadge role={role} />;
      },
    },
    {
      accessorKey: "is_active",
      header: "Statut",
      cell: ({ row }) => {
        const isActive = row.getValue("is_active") as boolean;
        return <UserStatusBadge isActive={isActive} />;
      },
    },
    {
      accessorKey: "created_at",
      header: "Date de création",
      cell: ({ row }) => {
        const createdAt = row.getValue("created_at") as string;
        if (!createdAt) return "-";
        
        return format(new Date(createdAt), "dd MMMM yyyy, HH:mm", { locale: fr });
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;
        
        return onEditUser && onDeleteUser ? (
          <UserTableActions 
            user={user} 
            onEdit={onEditUser} 
            onDelete={onDeleteUser} 
          />
        ) : null;
      },
    },
  ];
};
