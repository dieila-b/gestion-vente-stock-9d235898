
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

interface PasswordSectionProps {
  showPassword: boolean;
  newPassword: string;
  onPasswordChange: (value: string) => void;
  onTogglePasswordVisibility: () => void;
}

export function PasswordSection({ 
  showPassword, 
  newPassword, 
  onPasswordChange, 
  onTogglePasswordVisibility 
}: PasswordSectionProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="password" className="text-gray-300">Nouveau mot de passe</Label>
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          value={newPassword}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder="Laisser vide pour ne pas changer"
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
  );
}
