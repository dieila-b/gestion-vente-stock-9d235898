
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

interface UserStatusBadgeProps {
  isActive: boolean;
}

export const UserStatusBadge = ({ isActive }: UserStatusBadgeProps) => {
  return isActive ? (
    <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-200">
      <Check className="mr-1 h-3 w-3" /> Actif
    </Badge>
  ) : (
    <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
      <X className="mr-1 h-3 w-3" /> Inactif
    </Badge>
  );
};
