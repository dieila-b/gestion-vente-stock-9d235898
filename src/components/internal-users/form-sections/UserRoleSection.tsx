
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MapPin, BadgeCheck, ShieldCheck } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "@/types/user";
import { Switch } from "@/components/ui/switch";

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
      <h3 className="text-sm font-medium mb-3">Rôle et statut</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`role_${index}`} className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Rôle
          </Label>
          <Select 
            value={user.role} 
            onValueChange={(value) => handleRoleChange(value as "admin" | "manager" | "employee")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Administrateur</SelectItem>
              <SelectItem value="manager">Responsable</SelectItem>
              <SelectItem value="employee">Employé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      
        <div className="space-y-2">
          <Label htmlFor={`address_${index}`}>Adresse</Label>
          <div className="relative">
            <Input
              type="text"
              id={`address_${index}`}
              value={user.address}
              onChange={(e) => onInputChange(index, "address", e.target.value)}
              className="pl-9"
              placeholder="Adresse complète"
            />
            <MapPin className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
          </div>
        </div>
        
        <div>
          <Label htmlFor={`is_active_${index}`} className="flex items-center gap-2 mb-2">
            <BadgeCheck className="h-4 w-4" />
            Statut
          </Label>
          <div className="flex items-center justify-between px-3 py-2 border rounded-md">
            <span className="text-sm">{user.is_active ? "Utilisateur actif" : "Utilisateur inactif"}</span>
            <Switch 
              checked={user.is_active}
              onCheckedChange={(checked) => handleIsActiveChange(checked)}
              id={`is_active_${index}`}
            />
          </div>
        </div>
      </div>
    </>
  );
};
