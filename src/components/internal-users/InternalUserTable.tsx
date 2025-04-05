
import { InternalUser } from "@/types/internal-user";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, UserX, UserCheck } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface InternalUserTableProps {
  users: InternalUser[];
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
  onAddUser
}: InternalUserTableProps) => {
  console.log("InternalUserTable rendering with users:", users);
  console.log("isLoading:", isLoading);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    console.log("No users to display, showing empty state");
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-medium">Aucun utilisateur trouvé</h3>
        <p className="text-muted-foreground mt-2">
          Commencez par ajouter un nouvel utilisateur interne.
        </p>
        <Button onClick={onAddUser} className="mt-4">
          Ajouter un utilisateur
        </Button>
      </div>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Photo</TableHead>
            <TableHead>Nom complet</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Avatar>
                  {user.photo_url ? (
                    <AvatarImage src={user.photo_url} alt={`${user.first_name} ${user.last_name}`} />
                  ) : (
                    <AvatarFallback>{getInitials(user.first_name, user.last_name)}</AvatarFallback>
                  )}
                </Avatar>
              </TableCell>
              <TableCell className="font-medium">
                {user.first_name} {user.last_name}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : user.role === 'manager'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {user.role === 'admin' ? 'Admin' : user.role === 'manager' ? 'Manager' : 'Employé'}
                </span>
              </TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.is_active ? 'Actif' : 'Inactif'}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleStatus(user)}
                    title={user.is_active ? "Désactiver l'utilisateur" : "Activer l'utilisateur"}
                  >
                    {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(user)}
                    title="Modifier l'utilisateur"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(user)}
                    title="Supprimer l'utilisateur"
                    className="text-red-500 hover:text-red-700"
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
  );
};
