
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface TestingModeToggleProps {
  testingMode: boolean;
  enableTestingMode: () => void;
  disableTestingMode: () => void;
  isDevelopmentMode: boolean;
}

export const TestingModeToggle = ({ 
  testingMode, 
  enableTestingMode, 
  disableTestingMode,
  isDevelopmentMode
}: TestingModeToggleProps) => {
  if (isDevelopmentMode) return null;
  
  return (
    <div className="mt-4 p-2 border border-dashed border-yellow-400 rounded-md">
      <div className="flex items-center justify-between">
        <Label htmlFor="testing-mode" className="font-medium text-sm">
          Mode test en production
        </Label>
        <Switch 
          id="testing-mode" 
          checked={testingMode}
          onCheckedChange={(checked) => {
            if (checked) {
              enableTestingMode();
              toast.success("Mode test activé", {
                description: "L'authentification est maintenant contournée"
              });
            } else {
              disableTestingMode();
              toast.info("Mode test désactivé", {
                description: "L'authentification normale est restaurée"
              });
            }
          }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        ⚠️ Le mode test contourne l'authentification. Utiliser uniquement pour le développement.
      </p>
    </div>
  );
};
