
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/user";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function useEditUser(user: User, onOpenChange: (open: boolean) => void) {
  const queryClient = useQueryClient();
  const [userData, setUserData] = useState<User>({ ...user });
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof User, value: any) => {
    setUserData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const passwordsMatch = !newPassword || !passwordConfirmation || newPassword === passwordConfirmation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword && !passwordsMatch) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Build update object
      const updateData: any = {
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        address: userData.address,
        is_active: userData.is_active,
        photo_url: userData.photo_url,
      };
      
      // If new password was provided, include it
      if (newPassword) {
        updateData.password = newPassword;
      }
      
      // Update user in the database
      const { error } = await supabase
        .from('internal_users')
        .update(updateData)
        .eq('id', userData.id);
      
      if (error) {
        throw error;
      }
      
      // Refresh internal users data
      await queryClient.invalidateQueries({ queryKey: ['internal-users'] });
      
      // Success message
      toast.success("Utilisateur mis à jour avec succès");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      toast.error(`Erreur: ${error.message || "Une erreur est survenue"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    userData,
    showPassword,
    newPassword,
    passwordConfirmation,
    isSubmitting,
    passwordsMatch,
    handleInputChange,
    handlePasswordChange: setNewPassword,
    handlePasswordConfirmationChange: setPasswordConfirmation,
    togglePasswordVisibility,
    handleSubmit
  };
}
