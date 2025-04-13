import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { User } from "@/types/user";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Check, Edit, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
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

  const handleDeleteUser = (userId: string) => {
    if (onDeleteUser) {
      onDeleteUser(userId);
    }
  };

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
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;
        
        return (
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => handleEditClick(user)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
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
