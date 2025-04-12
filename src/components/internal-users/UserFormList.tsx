
import { Button } from "@/components/ui/button";
import { UserForm } from "./UserForm";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/user";

interface UserFormListProps {
  newUserData: Omit<User, 'id'>[];
  onAddUser: () => void;
  onBulkInsert: () => Promise<void>;
  onInputChange: (index: number, field: string, value: any) => void;
  onRemoveUser: (index: number) => void;
}

export const UserFormList = ({ 
  newUserData, 
  onAddUser, 
  onBulkInsert, 
  onInputChange, 
  onRemoveUser 
}: UserFormListProps) => {
  const handleImageUpload = async (index: number, file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `internal-users/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('lovable-uploads')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('lovable-uploads')
        .getPublicUrl(filePath);
      
      onInputChange(index, "photo_url", data.publicUrl);
      toast.success("Image téléchargée avec succès");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Erreur lors du téléchargement de l'image");
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Ajouter de Nouveaux Utilisateurs</h2>
      {newUserData.map((user, index) => (
        <UserForm 
          key={index} 
          user={user} 
          index={index} 
          onInputChange={onInputChange} 
          onRemove={onRemoveUser}
          onImageUpload={handleImageUpload}
        />
      ))}
      
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Button variant="outline" size="sm" onClick={onAddUser}>
          Ajouter un Utilisateur
        </Button>
        
        <Button 
          type="submit" 
          variant="default" 
          disabled={newUserData.length === 0}
          onClick={onBulkInsert}
        >
          Enregistrer les utilisateurs
        </Button>
      </div>
    </div>
  );
};
