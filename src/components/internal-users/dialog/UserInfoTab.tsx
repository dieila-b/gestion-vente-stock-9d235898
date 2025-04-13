
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { User } from "@/types/user";

interface UserInfoTabProps {
  formData: User;
  isLoading: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRoleChange: (value: string) => void;
  handleActiveChange: (checked: boolean) => void;
}

export const UserInfoTab = ({
  formData,
  isLoading,
  handleInputChange,
  handleRoleChange,
  handleActiveChange
}: UserInfoTabProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">Prénom</Label>
          <Input
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="last_name">Nom</Label>
          <Input
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            disabled={isLoading}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          disabled={isLoading}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Téléphone</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone || ''}
          onChange={handleInputChange}
          disabled={isLoading}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Adresse</Label>
        <Input
          id="address"
          name="address"
          value={formData.address || ''}
          onChange={handleInputChange}
          disabled={isLoading}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="role">Rôle</Label>
        <Select 
          value={formData.role} 
          onValueChange={handleRoleChange}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Administrateur</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="employee">Employé</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center justify-between">
        <Label htmlFor="is_active">Utilisateur actif</Label>
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={handleActiveChange}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};
