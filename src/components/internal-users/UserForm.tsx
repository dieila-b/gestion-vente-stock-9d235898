
import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import { Eye, EyeOff } from "lucide-react";
import { User } from "@/types/user";

interface UserFormProps {
  user: Omit<User, 'id'>;
  index: number;
  passwordConfirmation: string;
  showPassword: boolean;
  onInputChange: (index: number, field: string, value: any) => void;
  onPasswordConfirmationChange: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  onImageUpload: (index: number, file: File) => Promise<void>;
  onTogglePasswordVisibility: (index: number) => void;
}

export const UserForm = ({ 
  user, 
  index, 
  passwordConfirmation, 
  showPassword,
  onInputChange, 
  onPasswordConfirmationChange,
  onRemove, 
  onImageUpload,
  onTogglePasswordVisibility
}: UserFormProps) => {
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  
  const handleRoleChange = (role: "admin" | "manager" | "employee") => {
    onInputChange(index, "role", role);
  };

  const handleIsActiveChange = (isActive: boolean) => {
    onInputChange(index, "is_active", isActive);
  };
  
  const handleImageUploadWithLoading = async (file: File) => {
    setIsUploadLoading(true);
    try {
      await onImageUpload(index, file);
    } finally {
      setIsUploadLoading(false);
    }
  };

  const passwordsMatch = !user.password || !passwordConfirmation || user.password === passwordConfirmation;

  return (
    <div className="mb-4 p-4 border rounded-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        
        <div>
          <Label htmlFor={`first_name_${index}`}>Prénom</Label>
          <Input
            type="text"
            id={`first_name_${index}`}
            value={user.first_name}
            onChange={(e) => onInputChange(index, "first_name", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`last_name_${index}`}>Nom</Label>
          <Input
            type="text"
            id={`last_name_${index}`}
            value={user.last_name}
            onChange={(e) => onInputChange(index, "last_name", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`email_${index}`}>Email</Label>
          <Input
            type="email"
            id={`email_${index}`}
            value={user.email}
            onChange={(e) => onInputChange(index, "email", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`phone_${index}`}>Téléphone</Label>
          <Input
            type="tel"
            id={`phone_${index}`}
            value={user.phone}
            onChange={(e) => onInputChange(index, "phone", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`password_${index}`}>Mot de passe</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              id={`password_${index}`}
              value={user.password}
              onChange={(e) => onInputChange(index, "password", e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => onTogglePasswordVisibility(index)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>
        <div>
          <Label htmlFor={`password_confirmation_${index}`} className={!passwordsMatch ? "text-red-500" : ""}>
            Confirmation du mot de passe
          </Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              id={`password_confirmation_${index}`}
              value={passwordConfirmation || ""}
              onChange={(e) => onPasswordConfirmationChange(index, e.target.value)}
              className={`pr-10 ${!passwordsMatch ? "border-red-500 focus:ring-red-500" : ""}`}
            />
            {!passwordsMatch && (
              <p className="text-xs text-red-500 mt-1">
                Les mots de passe ne correspondent pas
              </p>
            )}
          </div>
        </div>
        <div>
          <Label htmlFor={`role_${index}`}>Rôle</Label>
          <Select 
            value={user.role} 
            onValueChange={(value) => handleRoleChange(value as "admin" | "manager" | "employee")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor={`address_${index}`}>Adresse</Label>
          <Input
            type="text"
            id={`address_${index}`}
            value={user.address}
            onChange={(e) => onInputChange(index, "address", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`is_active_${index}`}>Actif</Label>
          <Select 
            value={user.is_active ? "true" : "false"} 
            onValueChange={(value) => handleIsActiveChange(value === "true")}
          >
            <SelectTrigger>
              <SelectValue placeholder={user.is_active ? "Actif" : "Inactif"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Actif</SelectItem>
              <SelectItem value="false">Inactif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button variant="destructive" size="sm" className="mt-4" onClick={() => onRemove(index)}>
        Supprimer
      </Button>
    </div>
  );
};
