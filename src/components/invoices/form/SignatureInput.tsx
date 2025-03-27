
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Pen } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SignatureInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const SignatureInput = ({ value, onChange }: SignatureInputProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Veuillez sélectionner une image");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('signatures')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('signatures')
        .getPublicUrl(filePath);

      onChange(publicUrl);
      toast.success("Signature téléchargée avec succès");
    } catch (error) {
      console.error('Error uploading signature:', error);
      toast.error("Erreur lors du téléchargement de la signature");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="text-sm text-muted-foreground">Signature électronique</label>
      <div className="flex gap-4">
        <Input
          name="signature"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="enhanced-glass"
          placeholder="Votre signature..."
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="enhanced-glass hover:bg-white/10"
        >
          {isUploading ? (
            "Téléchargement..."
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Joindre
            </>
          )}
        </Button>
      </div>
      {value && value.startsWith('http') && (
        <div className="mt-2">
          <img 
            src={value} 
            alt="Signature" 
            className="max-h-20 object-contain rounded border border-gray-200 p-2 bg-white/5"
          />
        </div>
      )}
    </div>
  );
};
