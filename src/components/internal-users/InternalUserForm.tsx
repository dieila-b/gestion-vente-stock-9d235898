
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InternalUser } from "@/types/internal-user";
import { GeneralInfoTab } from "./form/GeneralInfoTab";
import { SecurityTab } from "./form/SecurityTab";
import { FormActions } from "./form/FormActions";

interface InternalUserFormProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedUser: InternalUser | null;
  securitySettings: {
    requirePasswordChange: boolean;
    twoFactorEnabled: boolean;
  };
  setSecuritySettings: (settings: {
    requirePasswordChange: boolean;
    twoFactorEnabled: boolean;
  }) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  onResetPassword: (user: InternalUser) => void;
}

export const InternalUserForm = ({
  activeTab,
  setActiveTab,
  selectedUser,
  securitySettings,
  setSecuritySettings,
  onSubmit,
  onCancel,
  onResetPassword,
}: InternalUserFormProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="general">Informations générales</TabsTrigger>
        <TabsTrigger value="security">Sécurité</TabsTrigger>
      </TabsList>

      <form onSubmit={onSubmit} className="mt-4">
        <TabsContent value="general" className="space-y-4">
          <GeneralInfoTab selectedUser={selectedUser} />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <SecurityTab
            selectedUser={selectedUser}
            securitySettings={securitySettings}
            setSecuritySettings={setSecuritySettings}
            onResetPassword={onResetPassword}
          />
        </TabsContent>

        <FormActions 
          isUpdating={!!selectedUser} 
          onCancel={onCancel} 
        />
      </form>
    </Tabs>
  );
};
