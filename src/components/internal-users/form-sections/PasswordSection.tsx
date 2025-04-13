
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { User } from "@/types/user";

interface PasswordSectionProps {
  index: number;
  password: string;
  passwordConfirmation: string;
  showPassword: boolean;
  onInputChange: (index: number, field: keyof Omit<User, 'id'>, value: string) => void;
  onPasswordConfirmationChange: (value: string) => void;
  onTogglePasswordVisibility: () => void;
}

export const PasswordSection = ({
  index,
  password,
  passwordConfirmation,
  showPassword,
  onInputChange,
  onPasswordConfirmationChange,
  onTogglePasswordVisibility
}: PasswordSectionProps) => {
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onInputChange(index, 'password', value);
    
    // Calculate password strength (simple version)
    let strength = 0;
    if (value.length > 6) strength += 1;
    if (value.length > 10) strength += 1;
    if (/[A-Z]/.test(value)) strength += 1;
    if (/[0-9]/.test(value)) strength += 1;
    if (/[^A-Za-z0-9]/.test(value)) strength += 1;
    
    setPasswordStrength(strength);
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={`password_${index}`}>Mot de passe</Label>
        <div className="relative">
          <Input
            id={`password_${index}`}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={handlePasswordChange}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            className="absolute right-0 top-0 h-full px-3"
            onClick={onTogglePasswordVisibility}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {password && (
          <div className="mt-1">
            <div className="h-1 w-full bg-gray-200 rounded-full mt-2">
              <div
                className={`h-1 rounded-full ${
                  passwordStrength <= 1
                    ? "bg-red-500"
                    : passwordStrength <= 3
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${(passwordStrength / 5) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {passwordStrength <= 1
                ? "Faible"
                : passwordStrength <= 3
                ? "Moyen"
                : "Fort"}
            </p>
          </div>
        )}
      </div>
      
      {index === 0 && (
        <div>
          <Label 
            htmlFor="password_confirmation"
            className={password && passwordConfirmation && password !== passwordConfirmation ? "text-destructive" : ""}
          >
            Confirmation du mot de passe
          </Label>
          <Input
            id="password_confirmation"
            type={showPassword ? "text" : "password"}
            value={passwordConfirmation}
            onChange={(e) => onPasswordConfirmationChange(e.target.value)}
            className={password && passwordConfirmation && password !== passwordConfirmation ? "border-destructive" : ""}
          />
          {password && passwordConfirmation && password !== passwordConfirmation && (
            <p className="text-xs text-destructive mt-1">
              Les mots de passe ne correspondent pas
            </p>
          )}
        </div>
      )}
    </div>
  );
};
