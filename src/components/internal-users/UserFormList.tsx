
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonalInfoSection } from "./form-sections/PersonalInfoSection";
import { PasswordSection } from "./form-sections/PasswordSection";
import { UserRoleSection } from "./form-sections/UserRoleSection";
import { ProfilePhotoSection } from "./form-sections/ProfilePhotoSection";
import { User } from "@/types/user";
import { Plus, Save, X } from "lucide-react";

interface UserFormListProps {
  newUserData: Omit<User, 'id'>[];
  passwordConfirmation: string;
  showPassword: boolean;
  onInputChange: (index: number, field: keyof Omit<User, 'id'>, value: string | boolean | "admin" | "manager" | "employee") => void;
  onPasswordConfirmationChange: (value: string) => void;
  onAddUser: () => void;
  onRemoveUser: (index: number) => void;
  onBulkInsert: () => Promise<void>;
  onTogglePasswordVisibility: () => void;
  onImageUpload?: (index: number, file: File) => Promise<void>;
}

export const UserFormList = ({
  newUserData,
  passwordConfirmation,
  showPassword,
  onInputChange,
  onPasswordConfirmationChange,
  onAddUser,
  onRemoveUser,
  onBulkInsert,
  onTogglePasswordVisibility,
  onImageUpload
}: UserFormListProps) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onBulkInsert();
  };

  // Update the PasswordSection to correctly handle the passwordConfirmation
  const handlePasswordConfirmationChange = (value: string) => {
    onPasswordConfirmationChange(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Ajouter des utilisateurs</h2>
        <Button variant="outline" onClick={onAddUser} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un utilisateur
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {newUserData.map((user, index) => (
          <Card key={index} className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                Utilisateur {index + 1}
              </CardTitle>
              {newUserData.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => onRemoveUser(index)}
                  className="h-8 w-8 text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {onImageUpload && (
                  <ProfilePhotoSection
                    user={user}
                    index={index}
                    onImageUpload={onImageUpload}
                  />
                )}
                
                <PersonalInfoSection
                  user={user}
                  index={index}
                  onInputChange={onInputChange}
                />
                
                <PasswordSection
                  index={index}
                  password={user.password || ""}
                  passwordConfirmation={index === 0 ? passwordConfirmation : ""}
                  showPassword={showPassword}
                  onInputChange={onInputChange}
                  onPasswordConfirmationChange={handlePasswordConfirmationChange}
                  onTogglePasswordVisibility={onTogglePasswordVisibility}
                />
                
                <UserRoleSection
                  user={user}
                  index={index}
                  onInputChange={onInputChange}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        <CardFooter className="flex justify-end pt-6">
          <Button type="submit" className="gap-2">
            <Save className="h-4 w-4" />
            Enregistrer les utilisateurs
          </Button>
        </CardFooter>
      </form>
    </div>
  );
};
