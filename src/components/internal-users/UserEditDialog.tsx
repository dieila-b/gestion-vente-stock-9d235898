
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { User } from "@/types/user";
import { DialogHeader } from "./dialog/DialogHeader";
import { DialogFooter } from "./dialog/DialogFooter";
import { UserFormContent } from "./dialog/UserFormContent";
import { useEditUserForm } from "@/hooks/internal-users/use-edit-user-form";

interface UserEditDialogProps {
  user: User;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (user: User) => void;
}

export const UserEditDialog = ({ user, isOpen, onOpenChange, onSave }: UserEditDialogProps) => {
  const {
    formData,
    isLoading,
    showPassword,
    newPassword,
    passwordConfirmation,
    activeTab,
    handleInputChange,
    handleRoleChange,
    handleActiveChange,
    togglePasswordVisibility,
    setNewPassword,
    setPasswordConfirmation,
    setActiveTab,
    handleSubmit
  } = useEditUserForm({
    user,
    onSave,
    onClose: () => onOpenChange(false)
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-xl">
        <DialogHeader 
          title="Modifier l'utilisateur" 
          description="Modifier les informations et le mot de passe de l'utilisateur" 
        />
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <UserFormContent
            formData={formData}
            isLoading={isLoading}
            showPassword={showPassword}
            newPassword={newPassword}
            passwordConfirmation={passwordConfirmation}
            activeTab={activeTab}
            handleInputChange={handleInputChange}
            handleRoleChange={handleRoleChange}
            handleActiveChange={handleActiveChange}
            togglePasswordVisibility={togglePasswordVisibility}
            setNewPassword={setNewPassword}
            setPasswordConfirmation={setPasswordConfirmation}
            setActiveTab={setActiveTab}
          />
          
          <DialogFooter
            isLoading={isLoading}
            onCancel={() => onOpenChange(false)}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};
