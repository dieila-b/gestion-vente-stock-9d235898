
import React from "react";
import { Switch } from "@/components/ui/switch";

interface PasswordChangeToggleProps {
  requirePasswordChange: boolean;
  onToggle: (checked: boolean) => void;
}

export const PasswordChangeToggle = ({
  requirePasswordChange,
  onToggle,
}: PasswordChangeToggleProps) => {
  return (
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
        checked={requirePasswordChange}
        onCheckedChange={onToggle}
      />
    </div>
  );
};
