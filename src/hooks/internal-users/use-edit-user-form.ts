
import { useState } from "react";
import { User } from "@/types/user";
import { toast } from "sonner";

interface UseEditUserFormProps {
  user: User;
  onSave: (user: User) => void;
  onClose: () => void;
}

export const useEditUserForm = ({ user, onSave, onClose }: UseEditUserFormProps) => {
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

  const validateForm = (): boolean => {
    // Password validation if a new password is provided
    if (newPassword) {
      if (newPassword.length < 6) {
        toast.error("Le mot de passe doit contenir au moins 6 caractères");
        return false;
      }
      
      if (newPassword !== passwordConfirmation) {
        toast.error("Les mots de passe ne correspondent pas");
        return false;
      }
    }
    
    // Required fields validation
    if (!formData.first_name?.trim()) {
      toast.error("Le prénom est requis");
      return false;
    }
    
    if (!formData.last_name?.trim()) {
      toast.error("Le nom est requis");
      return false;
    }
    
    if (!formData.email?.trim()) {
      toast.error("L'email est requis");
      return false;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("L'email n'est pas valide");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Add the new password to form data if provided
      if (newPassword) {
        formData.password = newPassword;
      }
      
      await onSave(formData);
      toast.success("Utilisateur mis à jour avec succès");
      onClose();
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      toast.error("Erreur lors de la mise à jour de l'utilisateur");
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
  };
};
