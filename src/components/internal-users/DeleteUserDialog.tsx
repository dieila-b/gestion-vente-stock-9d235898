
import {
  AlertDialog,
  AlertDialogContent,
} from "@/components/ui/alert-dialog";
import { DeleteConfirmation, DialogActions } from "./delete-dialog";
import { useDeleteUser } from "./delete-dialog/useDeleteUser";
import { DeleteUserDialogProps } from "./delete-dialog/types";

export function DeleteUserDialog({ user, open, onOpenChange }: DeleteUserDialogProps) {
  const { isDeleting, handleDelete } = useDeleteUser(user, onOpenChange);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#121212] text-white border-gray-700">
        <form onSubmit={(e) => {
          e.preventDefault();
          handleDelete();
        }}>
          <DeleteConfirmation user={user} />
          <DialogActions 
            isDeleting={isDeleting} 
            onCancel={() => onOpenChange(false)} 
          />
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
