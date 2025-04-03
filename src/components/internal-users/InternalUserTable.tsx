
import { User, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Loader2, UserPlus } from "lucide-react";
import { InternalUser } from "@/types/internal-user";

interface InternalUserTableProps {
  users: InternalUser[] | undefined;
  isLoading: boolean;
  onEdit: (user: InternalUser) => void;
  onDelete: (user: InternalUser) => void;
  onToggleStatus: (user: InternalUser) => void;
  onAddUser: () => void;
}

export const InternalUserTable = ({
  users,
  isLoading,
  onEdit,
  onDelete,
  onToggleStatus,
  onAddUser,
}: InternalUserTableProps) => {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "employee":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "actif":
        return "bg-green-100 text-green-800";
      case "inactif":
        return "bg-red-100 text-red-800";
      case "en attente":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement des utilisateurs...</span>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <Card className="p-6 flex flex-col items-center justify-center py-12">
        <UserPlus className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Aucun utilisateur interne</h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          Vous n'avez pas encore ajouté d'utilisateurs internes. Cliquez sur le bouton ci-dessous pour créer votre premier utilisateur.
        </p>
        <Button onClick={onAddUser}>
          <UserPlus className="mr-2 h-4 w-4" />
          Ajouter un utilisateur
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 overflow-hidden">
      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Actif</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  {user.first_name} {user.last_name}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone || "-"}</TableCell>
                <TableCell className="max-w-xs truncate">{user.address || "-"}</TableCell>
                <TableCell>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role === "admin"
                      ? "Administrateur"
                      : user.role === "manager"
                      ? "Manager"
                      : "Employé"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.is_active ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => onToggleStatus(user)}
                  >
                    {user.is_active ? "Actif" : "Inactif"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeColor(user.status)}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(user)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(user)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
