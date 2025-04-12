
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ImageUpload } from "@/components/ui/image-upload";
import { User } from "@/types/user";
import { Card, CardContent } from "@/components/ui/card";
import { UserRound } from "lucide-react";

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

  const getInitials = () => {
    const first = user.first_name?.charAt(0) || "";
    const last = user.last_name?.charAt(0) || "";
    
    return first || last ? `${first}${last}` : <UserRound className="h-6 w-6" />;
  };

  return (
    <div className="md:col-span-2 flex flex-col items-center">
      <Label htmlFor={`photo_${index}`} className="block mb-4 text-center">
        Photo de profil
      </Label>
      
      <div className="mb-4">
        <Avatar className="h-24 w-24">
          <AvatarImage 
            src={user.photo_url || ""} 
            alt={`${user.first_name} ${user.last_name}`} 
          />
          <AvatarFallback className="bg-primary/10">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
      </div>
      
      <Card className="w-full max-w-xs">
        <CardContent className="pt-4">
          <ImageUpload 
            onUpload={handleImageUploadWithLoading} 
            value={user.photo_url}
            disabled={isUploadLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
};
