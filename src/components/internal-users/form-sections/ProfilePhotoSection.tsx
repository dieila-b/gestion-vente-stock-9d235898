
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ImageUpload } from "@/components/ui/image-upload";
import { User } from "@/types/user";

interface ProfilePhotoSectionProps {
  user: Omit<User, 'id'>;
  index: number;
  onImageUpload: (index: number, file: File) => Promise<void>;
}

export const ProfilePhotoSection = ({ 
  user, 
  index, 
  onImageUpload 
}: ProfilePhotoSectionProps) => {
  const [isUploadLoading, setIsUploadLoading] = useState(false);

  const handleImageUploadWithLoading = async (file: File) => {
    setIsUploadLoading(true);
    try {
      await onImageUpload(index, file);
    } finally {
      setIsUploadLoading(false);
    }
  };

  return (
    <div className="md:col-span-2 flex justify-center mb-4">
      <div className="w-full max-w-xs">
        <Label htmlFor={`photo_${index}`} className="block mb-2 text-center">Photo de Profil</Label>
        {user.photo_url ? (
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.photo_url} alt={`${user.first_name} ${user.last_name}`} />
              <AvatarFallback>{user.first_name?.charAt(0) || ""}{user.last_name?.charAt(0) || ""}</AvatarFallback>
            </Avatar>
          </div>
        ) : null}
        <ImageUpload 
          onUpload={handleImageUploadWithLoading} 
          value={user.photo_url}
          disabled={isUploadLoading}
        />
      </div>
    </div>
  );
};
