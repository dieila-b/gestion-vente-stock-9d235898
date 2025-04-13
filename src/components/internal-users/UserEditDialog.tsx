
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { User } from "@/types/user";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DialogHeader } from "./dialog/DialogHeader";
import { UserInfoTab } from "./dialog/UserInfoTab";
import { PasswordTab } from "./dialog/PasswordTab";
import { DialogFooter } from "./dialog/DialogFooter";

interface UserEditDialogProps {
  user: User;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (user: User) => void;
}

export const UserEditDialog = ({ user, isOpen, onOpenChange, onSave }: UserEditDialogProps) => {
  const [formData, setFormData] = useState<User>({...user});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [activeTab, setActiveTab] = useState("information");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value as "admin" | "manager" | "employee"
    }));
  };

  const handleActiveChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      is_active: checked
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validation du mot de passe si un nouveau mot de passe est fourni
      if (newPassword) {
        if (newPassword.length < 6) {
          toast.error("Le mot de passe doit contenir au moins 6 caractères");
          setIsLoading(false);
          return;
        }
        
        if (newPassword !== passwordConfirmation) {
          toast.error("Les mots de passe ne correspondent pas");
          setIsLoading(false);
          return;
        }
        
        // Ajouter le nouveau mot de passe aux données du formulaire
        formData.password = newPassword;
      }
      
      onSave(formData);
      toast.success("Utilisateur mis à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      toast.error("Erreur lors de la mise à jour de l'utilisateur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-xl">
        <DialogHeader title="Modifier l'utilisateur" />
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="information">Informations</TabsTrigger>
              <TabsTrigger value="password">Mot de passe</TabsTrigger>
            </TabsList>
            
            <TabsContent value="information">
              <UserInfoTab
                formData={formData}
                isLoading={isLoading}
                handleInputChange={handleInputChange}
                handleRoleChange={handleRoleChange}
                handleActiveChange={handleActiveChange}
              />
            </TabsContent>
            
            <TabsContent value="password">
              <PasswordTab
                newPassword={newPassword}
                passwordConfirmation={passwordConfirmation}
                showPassword={showPassword}
                isLoading={isLoading}
                setNewPassword={setNewPassword}
                setPasswordConfirmation={setPasswordConfirmation}
                togglePasswordVisibility={togglePasswordVisibility}
              />
            </TabsContent>
          </Tabs>
          
          <DialogFooter
            isLoading={isLoading}
            onCancel={() => onOpenChange(false)}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};
