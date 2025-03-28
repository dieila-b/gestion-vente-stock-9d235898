
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { InternalUser } from "@/types/internal-user";

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
        
        <div className="flex items-center justify-between">
          <div>
            <label htmlFor="requirePasswordChange" className="text-sm font-medium">
              Exiger le changement de mot de passe à la prochaine connexion
            </label>
            <p className="text-xs text-muted-foreground">
              L'utilisateur sera obligé de changer son mot de passe lors de sa prochaine connexion
            </p>
          </div>
          <Switch 
            id="requirePasswordChange"
            name="requirePasswordChange"
            checked={securitySettings.requirePasswordChange}
            onCheckedChange={(checked) => 
              setSecuritySettings({
                ...securitySettings,
                requirePasswordChange: checked,
              })
            }
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <label htmlFor="twoFactorEnabled" className="text-sm font-medium">
              Authentification à deux facteurs
            </label>
            <p className="text-xs text-muted-foreground">
              Activer l'authentification à deux facteurs pour une sécurité renforcée
            </p>
          </div>
          <Switch 
            id="twoFactorEnabled"
            name="twoFactorEnabled"
            checked={securitySettings.twoFactorEnabled}
            onCheckedChange={(checked) => 
              setSecuritySettings({
                ...securitySettings,
                twoFactorEnabled: checked,
              })
            }
          />
        </div>
      </div>
      
      {selectedUser && (
        <div className="pt-4 border-t">
          <h3 className="text-lg font-medium mb-4">Actions</h3>
          <Button
            type="button"
            variant="outline"
            onClick={() => onResetPassword(selectedUser)}
          >
            Envoyer un email de réinitialisation de mot de passe
          </Button>
        </div>
      )}
    </div>
  );
};
