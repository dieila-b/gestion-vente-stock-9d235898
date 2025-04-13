
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "@/types/user";
import { ProfilePhotoSection } from "./form-sections/ProfilePhotoSection";
import { PersonalInfoSection } from "./form-sections/PersonalInfoSection";
import { PasswordSection } from "./form-sections/PasswordSection";
import { UserRoleSection } from "./form-sections/UserRoleSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

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
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">
          {user.first_name || user.last_name 
            ? `${user.first_name} ${user.last_name}`.trim() 
            : `Nouvel utilisateur ${index + 1}`}
        </CardTitle>
        <Button 
          variant="destructive" 
          size="icon" 
          onClick={() => onRemove(index)}
          title="Supprimer l'utilisateur"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfilePhotoSection 
            user={user} 
            index={index} 
            onImageUpload={onImageUpload} 
          />
          
          <div className="space-y-4">
            <PersonalInfoSection 
              user={user} 
              index={index} 
              onInputChange={onInputChange} 
            />
          </div>
          
          <div className="space-y-4">
            <PasswordSection 
              user={user}
              index={index}
              passwordConfirmation={passwordConfirmation}
              showPassword={showPassword}
              onInputChange={onInputChange}
              onPasswordConfirmationChange={onPasswordConfirmationChange}
              onTogglePasswordVisibility={onTogglePasswordVisibility}
            />
          </div>
          
          <div className="space-y-4">
            <UserRoleSection 
              user={user} 
              index={index} 
              onInputChange={onInputChange} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
