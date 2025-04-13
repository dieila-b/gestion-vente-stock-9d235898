
import { User } from "@/types/user";

export interface DeleteUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface DeleteDialogActionsProps {
  isDeleting: boolean;
  onCancel: () => void;
}
