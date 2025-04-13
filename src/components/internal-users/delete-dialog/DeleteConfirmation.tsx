
import { User } from "@/types/user";
import { 
  AlertDialogDescription, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";

interface DeleteConfirmationProps {
  user: User;
}

export function DeleteConfirmation({ user }: DeleteConfirmationProps) {
  return (
    <AlertDialogHeader>
      <AlertDialogTitle className="text-white">
        Êtes-vous sûr de vouloir supprimer cet utilisateur ?
      </AlertDialogTitle>
      <AlertDialogDescription className="text-gray-400">
        Cette action ne peut pas être annulée. Cela supprimera définitivement l'utilisateur 
        <span className="font-semibold text-gray-300"> {user.first_name} {user.last_name}</span> ({user.email}).
      </AlertDialogDescription>
    </AlertDialogHeader>
  );
}
