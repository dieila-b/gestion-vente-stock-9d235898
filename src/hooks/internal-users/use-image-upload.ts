
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file) return null;
    
    setIsUploading(true);
    try {
      // Vérification rapide du bucket
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'lovable-uploads');
      
      if (!bucketExists) {
        // En mode développement, simuler le téléchargement
        if (import.meta.env.MODE !== 'production') {
          // Simuler un délai de téléchargement
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Créer une URL de prévisualisation locale
          const objectURL = URL.createObjectURL(file);
          
          toast.info("Mode simulation: Image traitée localement (le bucket n'existe pas)");
          setIsUploading(false);
          return objectURL;
        } else {
          throw new Error("Le bucket de stockage n'est pas configuré");
        }
      }
      
      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `user-photos/${fileName}`;
      
      // Télécharger le fichier
      const { error: uploadError } = await supabase.storage
        .from('lovable-uploads')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Obtenir l'URL publique du fichier
      const { data } = supabase.storage
        .from('lovable-uploads')
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error: any) {
      console.error("Erreur lors du téléchargement de l'image:", error);
      toast.error(`Erreur lors du téléchargement: ${error.message || "Une erreur s'est produite"}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  return { uploadImage, isUploading };
};
