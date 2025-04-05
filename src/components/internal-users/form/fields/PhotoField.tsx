
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { ImageUpload } from "@/components/ui/image-upload";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { UserFormValues } from "../../validation/user-form-schema";

export const PhotoField = ({ form }: { form: UseFormReturn<UserFormValues> }) => {
  const [isUploading, setIsUploading] = useState(false);
  
  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      // En mode développement, simuler un téléchargement et renvoyer une URL de test
      if (import.meta.env.DEV) {
        // Simuler un délai de chargement
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Créer une URL de données pour le fichier
        const reader = new FileReader();
        reader.onloadend = () => {
          form.setValue("photo_url", reader.result as string);
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
      } else {
        // Implémentation pour la production serait ajoutée ici
        // Utilisation de Supabase Storage
        console.log("Upload de fichier en production non implémenté");
        setIsUploading(false);
      }
    } catch (error) {
      console.error("Erreur lors de l'upload de l'image:", error);
      setIsUploading(false);
    }
  };

  return (
    <FormField
      control={form.control}
      name="photo_url"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Photo de profil</FormLabel>
          <FormControl>
            <ImageUpload
              value={field.value || ""}
              onUpload={handleUpload}
              disabled={isUploading}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
