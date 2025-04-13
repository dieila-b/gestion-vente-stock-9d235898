
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff } from "lucide-react";

interface PasswordTabProps {
  newPassword: string;
  passwordConfirmation: string;
  showPassword: boolean;
  isLoading: boolean;
  setNewPassword: (value: string) => void;
  setPasswordConfirmation: (value: string) => void;
  togglePasswordVisibility: () => void;
}

export const PasswordTab = ({
  newPassword,
  passwordConfirmation,
  showPassword,
  isLoading,
  setNewPassword,
  setPasswordConfirmation,
  togglePasswordVisibility
}: PasswordTabProps) => {
  const passwordsMatch = !newPassword || !passwordConfirmation || newPassword === passwordConfirmation;
  
  const getPasswordStrength = () => {
    if (!newPassword) return "";
    if (newPassword.length < 6) return "faible";
    if (newPassword.length < 10) return "moyen";
    return "fort";
  };

  const getStrengthColor = () => {
    const strength = getPasswordStrength();
    switch(strength) {
      case "faible": return "bg-red-500";
      case "moyen": return "bg-yellow-500";
      case "fort": return "bg-green-500";
      default: return "bg-transparent";
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="new_password">Nouveau mot de passe</Label>
        <div className="relative">
          <Input
            id="new_password"
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isLoading}
            placeholder="Laissez vide pour ne pas modifier"
            className="pr-10"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-gray-500" />
            )}
          </button>
        </div>
        
        {newPassword && (
          <div className="mt-1">
            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getStrengthColor()}`} 
                style={{ width: newPassword.length > 12 ? '100%' : `${newPassword.length * 8}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Force du mot de passe: {getPasswordStrength()}
            </p>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label 
          htmlFor="password_confirmation"
          className={!passwordsMatch ? "text-destructive" : ""}
        >
          Confirmation du mot de passe
        </Label>
        <Input
          id="password_confirmation"
          type={showPassword ? "text" : "password"}
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          disabled={isLoading}
          className={!passwordsMatch ? "border-destructive focus:ring-destructive" : ""}
        />
        
        {!passwordsMatch && (
          <Alert variant="destructive" className="py-2 mt-2">
            <AlertDescription className="text-xs">
              Les mots de passe ne correspondent pas
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mt-4">
        <p className="text-amber-800 text-sm">
          <strong>Note:</strong> Laissez les champs vides si vous ne souhaitez pas modifier le mot de passe.
        </p>
      </div>
    </div>
  );
};
