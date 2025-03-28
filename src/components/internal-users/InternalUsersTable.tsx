
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, KeyRound, ShieldCheck } from "lucide-react";
import { InternalUser } from "@/types/internal-user";

interface InternalUsersTableProps {
  users: InternalUser[] | undefined;
  getRoleBadgeColor: (role: string) => string;
  onEdit: (user: InternalUser) => void;
  onDelete: (user: InternalUser) => void;
}

export const InternalUsersTable = ({
  users,
  getRoleBadgeColor,
  onEdit,
  onDelete,
}: InternalUsersTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Téléphone</TableHead>
          <TableHead>Rôle</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Sécurité</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users?.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              {user.first_name} {user.last_name}
            </TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.phone || "-"}</TableCell>
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
              >
                {user.is_active ? "Actif" : "Inactif"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex space-x-1">
                {user.require_password_change && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                    <KeyRound className="h-3 w-3 mr-1" />
                    Changement MDP
                  </Badge>
                )}
                {user.two_factor_enabled && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    2FA
                  </Badge>
                )}
              </div>
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
        {(!users || users.length === 0) && (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
              Aucun utilisateur trouvé
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
