
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";

interface TestingModeToggleProps {
  testingMode: boolean;
  enableTestingMode: () => void;
  disableTestingMode: () => void;
  isDevelopmentMode: boolean;
}

export function TestingModeToggle({
  testingMode,
  enableTestingMode,
  disableTestingMode,
  isDevelopmentMode
}: TestingModeToggleProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleToggle = (checked: boolean) => {
    if (checked) {
      if (!showConfirmation) {
        setShowConfirmation(true);
      } else {
        enableTestingMode();
        setShowConfirmation(false);
      }
    } else {
      disableTestingMode();
      setShowConfirmation(false);
    }
  };

  return (
    <div className="mt-4 border border-yellow-400/20 bg-yellow-400/5 rounded-md p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isDevelopmentMode ? (
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
          ) : testingMode ? (
            <ShieldAlert className="h-5 w-5 text-yellow-500" />
          ) : (
            <Shield className="h-5 w-5 text-muted-foreground" />
          )}
          
          <span className="text-sm font-medium">
            {isDevelopmentMode 
              ? "Mode développement actif"
              : "Activer le mode test"
            }
          </span>
        </div>
        
        {!isDevelopmentMode && (
          <Switch 
            checked={testingMode || showConfirmation}
            onCheckedChange={handleToggle}
          />
        )}
      </div>
      
      {showConfirmation && !testingMode && !isDevelopmentMode && (
        <div className="border-t border-yellow-400/20 pt-2 mt-2 text-sm">
          <p className="mb-2 text-yellow-600">
            Confirmez-vous l'activation du mode test ? 
            Ce mode est réservé aux administrateurs système.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirmation(false)}
              className="text-xs h-7"
            >
              Annuler
            </Button>
            <Button
              size="sm"
              onClick={() => {
                enableTestingMode();
                setShowConfirmation(false);
              }}
              className="text-xs h-7 bg-yellow-500 hover:bg-yellow-600"
            >
              Confirmer
            </Button>
          </div>
        </div>
      )}
      
      {testingMode && !isDevelopmentMode && (
        <p className="text-xs text-yellow-600">
          Mode test activé. L'authentification sera contournée en production.
        </p>
      )}
    </div>
  );
}
