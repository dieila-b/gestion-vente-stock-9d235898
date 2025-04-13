
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock } from "lucide-react";
import { User } from "@/types/user";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PasswordSectionProps {
  user: Omit<User, 'id'>;
  index: number;
  passwordConfirmation: string;
  showPassword: boolean;
  onInputChange: (index: number, field: string, value: any) => void;
  onPasswordConfirmationChange: (index: number, value: string) => void;
  onTogglePasswordVisibility: (index: number) => void;
}

export const PasswordSection = ({
  user,
  index,
  passwordConfirmation,
  showPassword,
  onInputChange,
  onPasswordConfirmationChange,
  onTogglePasswordVisibility
}: PasswordSectionProps) => {
  const passwordsMatch = !user.password || !passwordConfirmation || user.password === passwordConfirmation;
  const passwordStrength = user.password 
    ? user.password.length < 6 
      ? "faible" 
      : user.password.length < 10 
        ? "moyen" 
        : "fort"
    : "";

  const getStrengthColor = () => {
    switch(passwordStrength) {
      case "faible": return "bg-red-500";
      case "moyen": return "bg-yellow-500";
      case "fort": return "bg-green-500";
      default: return "bg-transparent";
    }
  };

  return (
    <>
      <h3 className="text-sm font-medium mb-3">Sécurité</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`password_${index}`}>Mot de passe</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              id={`password_${index}`}
              value={user.password}
              onChange={(e) => onInputChange(index, "password", e.target.value)}
              className="pl-9 pr-10"
              placeholder="Mot de passe"
            />
            <Lock className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => onTogglePasswordVisibility(index)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
            </button>
          </div>
          
          {user.password && (
            <div className="mt-1">
              <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full ${getStrengthColor()}`} style={{ width: user.password.length > 12 ? '100%' : `${user.password.length * 8}%` }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Force du mot de passe: {passwordStrength}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label 
            htmlFor={`password_confirmation_${index}`} 
            className={!passwordsMatch ? "text-destructive" : ""}
          >
            Confirmation du mot de passe
          </Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              id={`password_confirmation_${index}`}
              value={passwordConfirmation || ""}
              onChange={(e) => onPasswordConfirmationChange(index, e.target.value)}
              className={`pl-9 ${!passwordsMatch ? "border-destructive focus:ring-destructive" : ""}`}
              placeholder="Confirmation"
            />
            <Lock className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
          </div>
          
          {!passwordsMatch && (
            <Alert variant="destructive" className="py-2 mt-2">
              <AlertDescription className="text-xs">
                Les mots de passe ne correspondent pas
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </>
  );
};
