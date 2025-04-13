
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User } from "@/types/user";
import { useEditUser } from "./edit-dialog/useEditUser";
import { EditUserForm } from "./edit-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EditUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUserDialog({ user, open, onOpenChange }: EditUserDialogProps) {
  const {
    userData,
    showPassword,
    newPassword,
    passwordConfirmation,
    isSubmitting,
    isImageUploading,
    passwordsMatch,
    handleInputChange,
    handlePasswordChange,
    handlePasswordConfirmationChange,
    togglePasswordVisibility,
    handlePhotoUpload,
    handleSubmit
  } = useEditUser(user, onOpenChange);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] bg-[#121212] text-white border-gray-800 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl font-bold text-white">
            Modifier l'utilisateur
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)] px-6 pb-6">
          <form onSubmit={handleSubmit}>
            <EditUserForm
              userData={userData}
              showPassword={showPassword}
              newPassword={newPassword}
              passwordConfirmation={passwordConfirmation}
              isSubmitting={isSubmitting}
              isImageUploading={isImageUploading}
              passwordsMatch={passwordsMatch}
              onInputChange={handleInputChange}
              onPasswordChange={handlePasswordChange}
              onPasswordConfirmationChange={handlePasswordConfirmationChange}
              onTogglePasswordVisibility={togglePasswordVisibility}
              onPhotoUpload={handlePhotoUpload}
              onCancel={() => onOpenChange(false)}
            />
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
