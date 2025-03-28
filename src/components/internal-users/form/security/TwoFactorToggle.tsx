
import React from "react";
import { Switch } from "@/components/ui/switch";

interface TwoFactorToggleProps {
  twoFactorEnabled: boolean;
  onToggle: (checked: boolean) => void;
}

export const TwoFactorToggle = ({
  twoFactorEnabled,
  onToggle,
}: TwoFactorToggleProps) => {
  return (
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
        checked={twoFactorEnabled}
        onCheckedChange={onToggle}
      />
    </div>
  );
};
