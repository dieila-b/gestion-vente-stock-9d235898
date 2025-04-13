
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { User } from "@/types/user";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { UserActionsMenu } from "./UserActionsMenu";

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
}

export const UsersTable = ({ users, isLoading }: UsersTableProps) => {
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "photo_url",
      header: "Photo",
      cell: ({ row }) => {
        const photoUrl = row.getValue("photo_url") as string | undefined;
        const firstName = row.getValue("first_name") as string;
        const lastName = row.getValue("last_name") as string;
        const initials = `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`;
        
        return (
          <Avatar className="h-10 w-10">
            {photoUrl ? <AvatarImage src={photoUrl} alt={`${firstName} ${lastName}`} /> : null}
            <AvatarFallback>{initials || "U"}</AvatarFallback>
          </Avatar>
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
        
        let badgeVariant: "default" | "secondary" | "destructive" = "default";
        let displayRole = "Employé";
        
        switch (role) {
          case "admin":
            badgeVariant = "destructive";
            displayRole = "Administrateur";
            break;
          case "manager":
            badgeVariant = "secondary";
            displayRole = "Manager";
            break;
        }
        
        return <Badge variant={badgeVariant}>{displayRole}</Badge>;
      },
    },
    {
      accessorKey: "is_active",
      header: "Statut",
      cell: ({ row }) => {
        const isActive = row.getValue("is_active") as boolean;
        
        return isActive ? (
          <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-200">
            <Check className="mr-1 h-3 w-3" /> Actif
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            <X className="mr-1 h-3 w-3" /> Inactif
          </Badge>
        );
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
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;
        return <UserActionsMenu user={user} />;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Liste des Utilisateurs</h2>
      <DataTable
        columns={columns}
        data={users}
        searchColumn="email"
        searchPlaceholder="Rechercher par email..."
      />
    </div>
  );
};
