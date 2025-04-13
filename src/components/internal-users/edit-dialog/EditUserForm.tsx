
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DialogActions } from "./DialogActions";
import { PasswordTab } from "./PasswordTab";
import { UserInfoTab } from "./UserInfoTab";
import { EditUserFormProps } from "./types";

export function EditUserForm({ 
  userData, 
  newPassword,
  passwordConfirmation,
  showPassword, 
  isSubmitting,
  passwordsMatch,
  onInputChange, 
  onPasswordChange,
  onPasswordConfirmationChange,
  onTogglePasswordVisibility
}: EditUserFormProps) {
  
  return (
    <>
      <Tabs defaultValue="informations" className="mt-4">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="informations" className="rounded-none data-[state=active]:bg-[#1e293b] data-[state=active]:text-white">
            Informations
          </TabsTrigger>
          <TabsTrigger value="password" className="rounded-none data-[state=active]:bg-[#1e293b] data-[state=active]:text-white">
            Mot de passe
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="informations">
          <UserInfoTab 
            userData={userData}
            showPassword={showPassword}
            newPassword={newPassword}
            passwordConfirmation={passwordConfirmation}
            isSubmitting={isSubmitting}
            onInputChange={onInputChange}
            onPasswordChange={onPasswordChange}
            onPasswordConfirmationChange={onPasswordConfirmationChange}
            onTogglePasswordVisibility={onTogglePasswordVisibility}
            passwordsMatch={passwordsMatch}
          />
        </TabsContent>
        
        <TabsContent value="password">
          <PasswordTab 
            userData={userData}
            showPassword={showPassword}
            newPassword={newPassword}
            passwordConfirmation={passwordConfirmation}
            isSubmitting={isSubmitting}
            onInputChange={onInputChange}
            onPasswordChange={onPasswordChange}
            onPasswordConfirmationChange={onPasswordConfirmationChange}
            onTogglePasswordVisibility={onTogglePasswordVisibility}
            passwordsMatch={passwordsMatch}
          />
        </TabsContent>
      </Tabs>
      
      <DialogActions 
        isSubmitting={isSubmitting} 
        onCancel={() => {}} 
        disabled={newPassword && !passwordsMatch}
      />
    </>
  );
}
