
import { InternalUser } from "@/types/internal-user";
import { UserFormValues } from "./validation/user-form-schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserFormContent } from "./form/UserFormContent";

interface InternalUserFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (user: UserFormValues) => Promise<void>;
  selectedUser: InternalUser | null;
}

export const InternalUserForm = ({
  isOpen,
  onOpenChange,
  onSubmit,
  selectedUser,
}: InternalUserFormProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {selectedUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
          </DialogTitle>
        </DialogHeader>
        
        <UserFormContent
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          selectedUser={selectedUser}
        />
      </DialogContent>
    </Dialog>
  );
};
