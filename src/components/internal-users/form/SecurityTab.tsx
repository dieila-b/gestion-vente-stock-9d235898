
import React from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { KeyRound } from "lucide-react";
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
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="font-medium">Modifier le mot de passe à la première connexion</div>
            <div className="text-sm text-muted-foreground">
              L'utilisateur devra changer son mot de passe lors de sa première connexion
            </div>
          </div>
          <Switch
            checked={securitySettings.requirePasswordChange}
            onCheckedChange={(checked) => 
              setSecuritySettings({...securitySettings, requirePasswordChange: checked})}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="font-medium">Authentification à deux facteurs</div>
            <div className="text-sm text-muted-foreground">
              Activer l'authentification à deux facteurs pour cet utilisateur
            </div>
          </div>
          <Switch 
            checked={securitySettings.twoFactorEnabled}
            onCheckedChange={(checked) => 
              setSecuritySettings({...securitySettings, twoFactorEnabled: checked})}
          />
        </div>

        {selectedUser && (
          <Button 
            type="button"
            variant="outline"
            className="w-full mt-4"
            onClick={() => onResetPassword(selectedUser)}
          >
            <KeyRound className="mr-2 h-4 w-4" />
            Réinitialiser le mot de passe
          </Button>
        )}
      </div>
    </Card>
  );
};
