
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
  // Ne pas afficher en mode développement (déjà en bypass automatique)
  if (isDevelopmentMode) return null;
  
  return (
    <div className="mt-4">
      <Alert variant={testingMode ? "default" : "outline"} className="border-yellow-400/50 bg-yellow-50/50">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800">Mode test en production</AlertTitle>
        <AlertDescription className="text-yellow-700 mt-1">
          {testingMode 
            ? "Le mode test est activé. L'authentification est contournée."
            : "Activer ce mode pour contourner l'authentification en production."}
        </AlertDescription>
        
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-yellow-200">
          <Label htmlFor="testing-mode" className={`font-medium text-sm ${testingMode ? 'text-yellow-800' : 'text-muted-foreground'}`}>
            {testingMode ? "Mode test actif" : "Activer le mode test"}
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
      </Alert>
    </div>
  );
};
