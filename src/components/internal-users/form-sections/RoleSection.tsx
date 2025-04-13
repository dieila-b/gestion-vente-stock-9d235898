
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { User } from "@/types/user";

interface RoleSectionProps {
  userData: User;
  onInputChange: (field: keyof User, value: any) => void;
}

export function RoleSection({ userData, onInputChange }: RoleSectionProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="role" className="text-gray-300">Rôle</Label>
        <Select
          value={userData.role}
          onValueChange={(value) => onInputChange("role", value)}
        >
          <SelectTrigger id="role" className="bg-[#1e1e1e] border-gray-700 text-white">
            <SelectValue placeholder="Sélectionner un rôle" />
          </SelectTrigger>
          <SelectContent className="bg-[#1e1e1e] border-gray-700 text-white">
            <SelectItem value="admin">Administrateur</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="employee">Employé</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={userData.is_active}
          onCheckedChange={(checked) => onInputChange("is_active", checked)}
          className="data-[state=checked]:bg-purple-500"
        />
        <Label htmlFor="is_active" className="text-gray-300">Utilisateur actif</Label>
      </div>
    </>
  );
}
