
import React from "react";
import { InternalUser } from "@/types/internal-user";
import { PasswordChangeToggle } from "./security/PasswordChangeToggle";
import { TwoFactorToggle } from "./security/TwoFactorToggle";
import { ResetPasswordAction } from "./security/ResetPasswordAction";

interface SecurityTabProps {
  selectedUser: InternalUser | null;
  securitySettings: {
    requirePasswordChange: boolean;
    twoFactorEnabled: boolean;
  };
  setSecuritySettings: (settings: {
    requirePasswordChange: boolean;
    twoFactorEnabled: boolean;
  }) => void;
  onResetPassword: (user: InternalUser) => void;
}

export const SecurityTab = ({
  selectedUser,
  securitySettings,
  setSecuritySettings,
  onResetPassword,
}: SecurityTabProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Paramètres de sécurité</h3>
        
        <PasswordChangeToggle
          requirePasswordChange={securitySettings.requirePasswordChange}
          onToggle={(checked) => 
            setSecuritySettings({
              ...securitySettings,
              requirePasswordChange: checked,
            })
          }
        />
        
        <TwoFactorToggle
          twoFactorEnabled={securitySettings.twoFactorEnabled}
          onToggle={(checked) => 
            setSecuritySettings({
              ...securitySettings,
              twoFactorEnabled: checked,
            })
          }
        />
      </div>
      
      {selectedUser && (
        <ResetPasswordAction 
          user={selectedUser}
          onResetPassword={onResetPassword}
        />
      )}
    </div>
  );
};
