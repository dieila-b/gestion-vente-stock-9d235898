
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User } from "@/types/user";
import { User as UserIcon, Mail, Phone } from "lucide-react";

interface PersonalInfoSectionProps {
  user: Omit<User, 'id'>;
  index: number;
  onInputChange: (index: number, field: string, value: any) => void;
}

export const PersonalInfoSection = ({ 
  user, 
  index, 
  onInputChange 
}: PersonalInfoSectionProps) => {
  return (
    <>
      <h3 className="text-sm font-medium mb-3">Informations personnelles</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor={`first_name_${index}`}>Prénom</Label>
            <div className="relative">
              <Input
                type="text"
                id={`first_name_${index}`}
                value={user.first_name}
                onChange={(e) => onInputChange(index, "first_name", e.target.value)}
                className="pl-9"
                placeholder="Prénom"
              />
              <UserIcon className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`last_name_${index}`}>Nom</Label>
            <Input
              type="text"
              id={`last_name_${index}`}
              value={user.last_name}
              onChange={(e) => onInputChange(index, "last_name", e.target.value)}
              placeholder="Nom"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`email_${index}`}>Email</Label>
          <div className="relative">
            <Input
              type="email"
              id={`email_${index}`}
              value={user.email}
              onChange={(e) => onInputChange(index, "email", e.target.value)}
              className="pl-9"
              placeholder="email@exemple.com"
            />
            <Mail className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`phone_${index}`}>Téléphone</Label>
          <div className="relative">
            <Input
              type="tel"
              id={`phone_${index}`}
              value={user.phone}
              onChange={(e) => onInputChange(index, "phone", e.target.value)}
              className="pl-9"
              placeholder="+33 6 12 34 56 78"
            />
            <Phone className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
          </div>
        </div>
      </div>
    </>
  );
};
