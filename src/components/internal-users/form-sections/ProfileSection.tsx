
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ui/image-upload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProfileSectionProps {
  photoUrl?: string;
  onImageUpload: (url: string) => void;
  disabled: boolean;
}

export function ProfileSection({ photoUrl, onImageUpload, disabled }: ProfileSectionProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;
      
      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('lovable-uploads')
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL of the uploaded file
      const { data } = supabase.storage
        .from('lovable-uploads')
        .getPublicUrl(filePath);
      
      // Update the user data with the new photo URL
      onImageUpload(data.publicUrl);
      
      toast.success("Photo de profil téléchargée avec succès");
    } catch (error: any) {
      console.error("Erreur lors du téléchargement de l'image:", error);
      toast.error(`Erreur: ${error.message || "Une erreur est survenue"}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mb-6 flex justify-center">
      <div className="w-full max-w-xs">
        <Label htmlFor="photo" className="block mb-2 text-center text-gray-300">Photo de profil</Label>
        <ImageUpload 
          value={photoUrl} 
          onUpload={handleImageUpload}
          disabled={isUploading || disabled}
        />
      </div>
    </div>
  );
}
