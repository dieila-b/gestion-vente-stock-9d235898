
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/types/user";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { EditUserFormProps } from "./types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { UserRound, Loader2 } from "lucide-react";

export function UserInfoTab({ 
  userData, 
  onInputChange,
  isImageUploading,
  onPhotoUpload
}: EditUserFormProps) {
  
  const getInitials = () => {
    const first = userData.first_name?.charAt(0) || "";
    const last = userData.last_name?.charAt(0) || "";
    
    return first || last ? `${first}${last}` : <UserRound className="h-6 w-6" />;
  };

  return (
    <div className="space-y-4">
      {/* Profile Photo Section */}
      <div className="mb-6 flex flex-col items-center">
        <Label htmlFor="photo" className="block mb-4 text-center text-gray-300">
          Photo de profil
        </Label>
        
        <div className="mb-4">
          <Avatar className="h-24 w-24">
            {isImageUploading ? (
              <AvatarFallback className="bg-[#1e1e1e] border-gray-700">
                <Loader2 className="h-6 w-6 animate-spin" />
              </AvatarFallback>
            ) : (
              <>
                <AvatarImage 
                  src={userData.photo_url || ""} 
                  alt={`${userData.first_name} ${userData.last_name}`} 
                />
                <AvatarFallback className="bg-[#1e1e1e] border-gray-700 text-gray-300">
                  {getInitials()}
                </AvatarFallback>
              </>
            )}
          </Avatar>
        </div>
        
        <Card className="w-full max-w-xs bg-[#1e1e1e] border-gray-700">
          <CardContent className="pt-4">
            <ImageUpload 
              onUpload={onPhotoUpload} 
              value={userData.photo_url}
              disabled={isImageUploading}
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name" className="text-gray-300">Prénom</Label>
          <Input
            id="first_name"
            value={userData.first_name}
            onChange={(e) => onInputChange("first_name", e.target.value)}
            required
            className="bg-[#1e1e1e] border-gray-700 text-white"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="last_name" className="text-gray-300">Nom</Label>
          <Input
            id="last_name"
            value={userData.last_name}
            onChange={(e) => onInputChange("last_name", e.target.value)}
            required
            className="bg-[#1e1e1e] border-gray-700 text-white"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-300">Email</Label>
        <Input
          id="email"
          type="email"
          value={userData.email}
          onChange={(e) => onInputChange("email", e.target.value)}
          required
          className="bg-[#1e1e1e] border-gray-700 text-white"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-gray-300">Téléphone</Label>
        <Input
          id="phone"
          value={userData.phone}
          onChange={(e) => onInputChange("phone", e.target.value)}
          className="bg-[#1e1e1e] border-gray-700 text-white"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address" className="text-gray-300">Adresse</Label>
        <Input
          id="address"
          value={userData.address}
          onChange={(e) => onInputChange("address", e.target.value)}
          className="bg-[#1e1e1e] border-gray-700 text-white"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="role" className="text-gray-300">Rôle</Label>
        <Select
          value={userData.role}
          onValueChange={(value) => onInputChange("role", value)}
        >
          <SelectTrigger id="role" className="bg-[#1e1e1e] border-gray-700 text-white">
            <SelectValue placeholder="Sélectionner un rôle" />
          </SelectTrigger>
          <SelectContent className="bg-[#1e1e1e] border-gray-700 text-white">
            <SelectItem value="admin">Administrateur</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="employee">Employé</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={userData.is_active}
          onCheckedChange={(checked) => onInputChange("is_active", checked)}
          className="data-[state=checked]:bg-purple-500"
        />
        <Label htmlFor="is_active" className="text-gray-300">Utilisateur actif</Label>
      </div>
    </div>
  );
}
