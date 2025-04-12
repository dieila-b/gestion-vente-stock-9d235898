
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User } from "@/types/user";

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
      <div>
        <Label htmlFor={`first_name_${index}`}>Prénom</Label>
        <Input
          type="text"
          id={`first_name_${index}`}
          value={user.first_name}
          onChange={(e) => onInputChange(index, "first_name", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor={`last_name_${index}`}>Nom</Label>
        <Input
          type="text"
          id={`last_name_${index}`}
          value={user.last_name}
          onChange={(e) => onInputChange(index, "last_name", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor={`email_${index}`}>Email</Label>
        <Input
          type="email"
          id={`email_${index}`}
          value={user.email}
          onChange={(e) => onInputChange(index, "email", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor={`phone_${index}`}>Téléphone</Label>
        <Input
          type="tel"
          id={`phone_${index}`}
          value={user.phone}
          onChange={(e) => onInputChange(index, "phone", e.target.value)}
        />
      </div>
    </>
  );
};
