
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User } from "@/types/user";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSection } from "./form-sections/ProfileSection";
import { BasicInfoSection } from "./form-sections/BasicInfoSection";
import { RoleSection } from "./form-sections/RoleSection";
import { PasswordSection } from "./form-sections/PasswordSection";
import { DialogFormActions } from "./form-sections/DialogFormActions";

interface EditUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUserDialog({ user, open, onOpenChange }: EditUserDialogProps) {
  const queryClient = useQueryClient();
  const [userData, setUserData] = useState<User>({ ...user });
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (field: keyof User, value: any) => {
    setUserData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleImageUpload = (url: string) => {
    handleInputChange('photo_url', url);
    setIsUploading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[#121212] text-white border-gray-800">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Modifier l'utilisateur
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="informations" className="mt-4">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="informations" className="rounded-none data-[state=active]:bg-[#1e293b] data-[state=active]:text-white">
                Informations
              </TabsTrigger>
              <TabsTrigger value="password" className="rounded-none data-[state=active]:bg-[#1e293b] data-[state=active]:text-white">
                Mot de passe
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="informations" className="space-y-4">
              <ProfileSection 
                photoUrl={userData.photo_url} 
                onImageUpload={handleImageUpload} 
                disabled={isSubmitting}
              />
              
              <BasicInfoSection 
                userData={userData} 
                onInputChange={handleInputChange} 
              />
              
              <RoleSection 
                userData={userData} 
                onInputChange={handleInputChange} 
              />
            </TabsContent>
            
            <TabsContent value="password" className="space-y-4">
              <PasswordSection 
                showPassword={showPassword}
                newPassword={newPassword}
                onPasswordChange={setNewPassword}
                onTogglePasswordVisibility={togglePasswordVisibility}
              />
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-6 gap-2">
            <DialogFormActions 
              isSubmitting={isSubmitting}
              isUploading={isUploading}
              onCancel={() => onOpenChange(false)}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
