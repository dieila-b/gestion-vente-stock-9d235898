
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/types/user";

interface BasicInfoSectionProps {
  userData: User;
  onInputChange: (field: keyof User, value: any) => void;
}

export function BasicInfoSection({ userData, onInputChange }: BasicInfoSectionProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name" className="text-gray-300">Prénom</Label>
          <Input
            id="first_name"
            value={userData.first_name}
            onChange={(e) => onInputChange("first_name", e.target.value)}
            required
            className="bg-[#1e1e1e] border-gray-700 text-white"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="last_name" className="text-gray-300">Nom</Label>
          <Input
            id="last_name"
            value={userData.last_name}
            onChange={(e) => onInputChange("last_name", e.target.value)}
            required
            className="bg-[#1e1e1e] border-gray-700 text-white"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-300">Email</Label>
        <Input
          id="email"
          type="email"
          value={userData.email}
          onChange={(e) => onInputChange("email", e.target.value)}
          required
          className="bg-[#1e1e1e] border-gray-700 text-white"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-gray-300">Téléphone</Label>
        <Input
          id="phone"
          value={userData.phone}
          onChange={(e) => onInputChange("phone", e.target.value)}
          className="bg-[#1e1e1e] border-gray-700 text-white"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address" className="text-gray-300">Adresse</Label>
        <Input
          id="address"
          value={userData.address}
          onChange={(e) => onInputChange("address", e.target.value)}
          className="bg-[#1e1e1e] border-gray-700 text-white"
        />
      </div>
    </>
  );
}
