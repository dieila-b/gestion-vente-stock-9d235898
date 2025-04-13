
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { EditUserFormProps } from "./types";

export function PasswordTab({ 
  showPassword, 
  newPassword,
  passwordConfirmation,
  passwordsMatch,
  onPasswordChange,
  onPasswordConfirmationChange,
  onTogglePasswordVisibility
}: EditUserFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-300">Nouveau mot de passe</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="Laissez vide pour ne pas modifier"
            className="pr-10 bg-[#1e1e1e] border-gray-700 text-white"
          />
          <Button 
            type="button"
            variant="ghost" 
            size="icon"
            className="absolute right-0 top-0 h-full text-gray-400"
            onClick={onTogglePasswordVisibility}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label 
          htmlFor="password_confirmation" 
          className={!passwordsMatch ? "text-destructive" : "text-gray-300"}
        >
          Confirmation du mot de passe
        </Label>
        <Input
          id="password_confirmation"
          type={showPassword ? "text" : "password"}
          value={passwordConfirmation}
          onChange={(e) => onPasswordConfirmationChange(e.target.value)}
          placeholder="Confirmation du mot de passe"
          className={`bg-[#1e1e1e] border-gray-700 text-white ${!passwordsMatch ? "border-destructive" : ""}`}
        />
      </div>
      
      <Alert className="bg-amber-100/20 border-amber-200/30 text-amber-500">
        <AlertDescription>
          Note: Laissez les champs vides si vous ne souhaitez pas modifier le mot de passe.
        </AlertDescription>
      </Alert>
    </div>
  );
}
