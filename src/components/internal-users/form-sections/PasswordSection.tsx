
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { User } from "@/types/user";

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

  return (
    <>
      <div>
        <Label htmlFor={`password_${index}`}>Mot de passe</Label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            id={`password_${index}`}
            value={user.password}
            onChange={(e) => onInputChange(index, "password", e.target.value)}
            className="pr-10"
          />
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
      </div>
      <div>
        <Label htmlFor={`password_confirmation_${index}`} className={!passwordsMatch ? "text-red-500" : ""}>
          Confirmation du mot de passe
        </Label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            id={`password_confirmation_${index}`}
            value={passwordConfirmation || ""}
            onChange={(e) => onPasswordConfirmationChange(index, e.target.value)}
            className={`pr-10 ${!passwordsMatch ? "border-red-500 focus:ring-red-500" : ""}`}
          />
          {!passwordsMatch && (
            <p className="text-xs text-red-500 mt-1">
              Les mots de passe ne correspondent pas
            </p>
          )}
        </div>
      </div>
    </>
  );
};
