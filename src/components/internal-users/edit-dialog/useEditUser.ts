
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/user";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";

export function useEditUser(user: User, onOpenChange: (open: boolean) => void) {
  const queryClient = useQueryClient();
  const [userData, setUserData] = useState<User>({ ...user });
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

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

  const handlePhotoUpload = async (file: File) => {
    try {
      setIsImageUploading(true);
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `internal-users/${fileName}`;
      
      // Check if a bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      
      // Look for lovable-uploads bucket
      const uploadsBucket = buckets?.find(bucket => bucket.name === 'lovable-uploads');
      
      if (!uploadsBucket) {
        throw new Error('Storage bucket not found');
      }
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('lovable-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data } = supabase.storage
        .from('lovable-uploads')
        .getPublicUrl(filePath);
      
      // Update user data with new photo URL
      handleInputChange('photo_url', data.publicUrl);
      
      toast.success('Photo de profil téléchargée avec succès');
    } catch (error: any) {
      console.error('Erreur lors du téléchargement de la photo:', error);
      toast.error(`Erreur: ${error.message || "Une erreur est survenue"}`);
    } finally {
      setIsImageUploading(false);
    }
  };

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
    isImageUploading,
    passwordsMatch,
    handleInputChange,
    handlePasswordChange: setNewPassword,
    handlePasswordConfirmationChange: setPasswordConfirmation,
    togglePasswordVisibility,
    handlePhotoUpload,
    handleSubmit
  };
}
