
import { Button } from "@/components/ui/button";
import { UserForm } from "./UserForm";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/user";
import { Loader2, Save, UserPlus } from "lucide-react";
import { useState } from "react";

interface UserFormListProps {
  newUserData: Omit<User, 'id'>[];
  passwordConfirmation: { [key: number]: string };
  showPassword: { [key: number]: boolean };
  onAddUser: () => void;
  onBulkInsert: () => Promise<void>;
  onInputChange: (index: number, field: string, value: any) => void;
  onPasswordConfirmationChange: (index: number, value: string) => void;
  onRemoveUser: (index: number) => void;
  onTogglePasswordVisibility: (index: number) => void;
}

export const UserFormList = ({ 
  newUserData, 
  passwordConfirmation,
  showPassword,
  onAddUser, 
  onBulkInsert, 
  onInputChange,
  onPasswordConfirmationChange,
  onRemoveUser,
  onTogglePasswordVisibility
}: UserFormListProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleImageUpload = async (index: number, file: File) => {
    try {
      // Check file size - 20MB
      const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes
      if (file.size > MAX_FILE_SIZE) {
        console.error("File size exceeds limit", file.size);
        toast.error(`La taille du fichier dépasse la limite de 20MB. Taille actuelle: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
        return;
      }
      
      // Prepare the file information
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `internal-users/${fileName}`;
      
      toast.loading("Téléchargement de l'image en cours...");
      
      // Upload the file with debugging
      console.log("Uploading file to path:", filePath);
      console.log("File size:", file.size, "bytes");
      console.log("File type:", file.type);
      
      // List buckets first to verify
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      console.log("Available buckets:", buckets);
      
      if (bucketsError) {
        console.error("Error listing buckets:", bucketsError);
        toast.dismiss();
        toast.error(`Erreur lors de la vérification des buckets: ${bucketsError.message}`);
        return;
      }
      
      // Now upload the file
      const { error: uploadError, data } = await supabase.storage
        .from('lovable-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        toast.dismiss();
        toast.error(`Erreur lors du téléchargement de l'image: ${uploadError.message}`);
        return;
      }
      
      toast.dismiss();
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('lovable-uploads')
        .getPublicUrl(filePath);
      
      console.log("Image uploaded successfully, public URL:", urlData.publicUrl);
      onInputChange(index, "photo_url", urlData.publicUrl);
      toast.success("Image téléchargée avec succès");
    } catch (error: any) {
      toast.dismiss();
      console.error("Error in image upload process:", error);
      toast.error(`Erreur lors du téléchargement de l'image: ${error.message || error}`);
    }
  };

  const handleSubmit = async () => {
    console.log("Starting user submission with data:", newUserData);
    setIsSubmitting(true);
    try {
      await onBulkInsert();
    } catch (error) {
      console.error("Error in form submission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Ajouter de Nouveaux Utilisateurs</h2>
      
      {newUserData.length === 0 ? (
        <div className="bg-muted/30 rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-4">Aucun utilisateur à ajouter</p>
          <Button 
            variant="outline" 
            onClick={onAddUser}
            className="mx-auto"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Ajouter un utilisateur
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {newUserData.map((user, index) => (
              <UserForm 
                key={index} 
                user={user} 
                index={index}
                passwordConfirmation={passwordConfirmation[index] || ""}
                showPassword={showPassword[index] || false}
                onInputChange={onInputChange}
                onPasswordConfirmationChange={onPasswordConfirmationChange}
                onRemove={onRemoveUser}
                onImageUpload={handleImageUpload}
                onTogglePasswordVisibility={onTogglePasswordVisibility}
              />
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-between pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={onAddUser}
              className="flex items-center"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Ajouter un utilisateur
            </Button>
            
            <Button 
              variant="default" 
              disabled={newUserData.length === 0 || isSubmitting}
              onClick={handleSubmit}
              className="flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer les utilisateurs
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
