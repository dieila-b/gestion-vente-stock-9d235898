
import { useState } from "react";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadSectionProps {
  value?: string;
  onChange: (url: string) => void;
}

export const ImageUploadSection = ({ value, onChange }: ImageUploadSectionProps) => {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const filePath = `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      onChange(publicUrl);
      toast.success("Image téléchargée avec succès");
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Erreur lors du téléchargement de l'image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="md:col-span-2">
      <label className="text-sm text-muted-foreground mb-2 block">Image du produit</label>
      <ImageUpload
        onUpload={handleImageUpload}
        value={value}
        disabled={uploading}
      />
    </div>
  );
};
