
import { useCallback, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, ImageIcon, Loader2 } from "lucide-react";

interface ImageUploadProps {
  onUpload: (file: File) => Promise<void>;
  value?: string;
  disabled?: boolean;
}

export const ImageUpload = ({ onUpload, value, disabled }: ImageUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processUpload = async (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setIsUploading(true);
      try {
        await onUpload(file);
      } catch (error) {
        console.error("Error during upload:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled || isUploading) return;

      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) {
        processUpload(file);
      }
    },
    [onUpload, disabled, isUploading]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      
      if (disabled || isUploading) return;
      
      const file = e.target.files && e.target.files[0];
      if (file) {
        processUpload(file);
      }
    },
    [onUpload, disabled, isUploading]
  );

  const handleButtonClick = () => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-4 text-center 
        ${dragActive ? "border-primary" : "border-gray-300"} 
        ${disabled || isUploading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
        transition-colors duration-200 ease-in-out`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleChange}
        disabled={disabled || isUploading}
      />

      {value ? (
        <div className="space-y-4">
          <img
            src={value}
            alt="User"
            className="mx-auto max-h-48 object-contain rounded-lg"
          />
          <Button
            type="button"
            variant="outline"
            className="mt-2"
            disabled={disabled || isUploading}
            onClick={handleButtonClick}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Chargement...
              </>
            ) : (
              "Changer l'image"
            )}
          </Button>
        </div>
      ) : (
        <div
          className="flex flex-col items-center gap-2 p-4"
          onClick={handleButtonClick}
        >
          {isUploading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span>Téléchargement en cours...</span>
            </div>
          ) : disabled ? (
            <div className="animate-pulse flex items-center gap-2">
              <Upload className="h-6 w-6" />
              <span>Téléchargement en attente...</span>
            </div>
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-gray-400" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Glissez-déposez une image ici ou cliquez pour parcourir
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG jusqu'à 10MB
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
