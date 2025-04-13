
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User } from "@/types/user";
import { useEditUser } from "./edit-dialog/useEditUser";
import { EditUserForm } from "./edit-dialog";

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
      <DialogContent className="sm:max-w-[500px] bg-[#121212] text-white border-gray-800">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Modifier l'utilisateur
            </DialogTitle>
          </DialogHeader>
          
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
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
