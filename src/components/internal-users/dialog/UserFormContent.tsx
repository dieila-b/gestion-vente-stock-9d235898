
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/types/user";
import { UserInfoTab } from "./UserInfoTab";
import { PasswordTab } from "./PasswordTab";

interface UserFormContentProps {
  formData: User;
  isLoading: boolean;
  showPassword: boolean;
  newPassword: string;
  passwordConfirmation: string;
  activeTab: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRoleChange: (value: string) => void;
  handleActiveChange: (checked: boolean) => void;
  togglePasswordVisibility: () => void;
  setNewPassword: (value: string) => void;
  setPasswordConfirmation: (value: string) => void;
  setActiveTab: (value: string) => void;
}

export const UserFormContent = ({
  formData,
  isLoading,
  showPassword,
  newPassword,
  passwordConfirmation,
  activeTab,
  handleInputChange,
  handleRoleChange,
  handleActiveChange,
  togglePasswordVisibility,
  setNewPassword,
  setPasswordConfirmation,
  setActiveTab
}: UserFormContentProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="information">Informations</TabsTrigger>
        <TabsTrigger value="password">Mot de passe</TabsTrigger>
      </TabsList>
      
      <TabsContent value="information">
        <UserInfoTab
          formData={formData}
          isLoading={isLoading}
          handleInputChange={handleInputChange}
          handleRoleChange={handleRoleChange}
          handleActiveChange={handleActiveChange}
        />
      </TabsContent>
      
      <TabsContent value="password">
        <PasswordTab
          newPassword={newPassword}
          passwordConfirmation={passwordConfirmation}
          showPassword={showPassword}
          isLoading={isLoading}
          setNewPassword={setNewPassword}
          setPasswordConfirmation={setPasswordConfirmation}
          togglePasswordVisibility={togglePasswordVisibility}
        />
      </TabsContent>
    </Tabs>
  );
};
