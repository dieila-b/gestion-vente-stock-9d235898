
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "@/types/user";
import { ProfilePhotoSection } from "./form-sections/ProfilePhotoSection";
import { PersonalInfoSection } from "./form-sections/PersonalInfoSection";
import { PasswordSection } from "./form-sections/PasswordSection";
import { UserRoleSection } from "./form-sections/UserRoleSection";

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
  return (
    <div className="mb-4 p-4 border rounded-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProfilePhotoSection 
          user={user} 
          index={index} 
          onImageUpload={onImageUpload} 
        />
        
        <PersonalInfoSection 
          user={user} 
          index={index} 
          onInputChange={onInputChange} 
        />
        
        <PasswordSection 
          user={user}
          index={index}
          passwordConfirmation={passwordConfirmation}
          showPassword={showPassword}
          onInputChange={onInputChange}
          onPasswordConfirmationChange={onPasswordConfirmationChange}
          onTogglePasswordVisibility={onTogglePasswordVisibility}
        />
        
        <UserRoleSection 
          user={user} 
          index={index} 
          onInputChange={onInputChange} 
        />
      </div>
      <Button variant="destructive" size="sm" className="mt-4" onClick={() => onRemove(index)}>
        Supprimer
      </Button>
    </div>
  );
};
