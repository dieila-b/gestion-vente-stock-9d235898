
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "@/types/user";

interface UserRoleSectionProps {
  user: Omit<User, 'id'>;
  index: number;
  onInputChange: (index: number, field: string, value: any) => void;
}

export const UserRoleSection = ({ 
  user, 
  index, 
  onInputChange 
}: UserRoleSectionProps) => {
  const handleRoleChange = (role: "admin" | "manager" | "employee") => {
    onInputChange(index, "role", role);
  };

  const handleIsActiveChange = (isActive: boolean) => {
    onInputChange(index, "is_active", isActive);
  };

  return (
    <>
      <div>
        <Label htmlFor={`role_${index}`}>Rôle</Label>
        <Select 
          value={user.role} 
          onValueChange={(value) => handleRoleChange(value as "admin" | "manager" | "employee")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="employee">Employee</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor={`address_${index}`}>Adresse</Label>
        <Input
          type="text"
          id={`address_${index}`}
          value={user.address}
          onChange={(e) => onInputChange(index, "address", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor={`is_active_${index}`}>Actif</Label>
        <Select 
          value={user.is_active ? "true" : "false"} 
          onValueChange={(value) => handleIsActiveChange(value === "true")}
        >
          <SelectTrigger>
            <SelectValue placeholder={user.is_active ? "Actif" : "Inactif"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Actif</SelectItem>
            <SelectItem value="false">Inactif</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};
