
import { Badge } from "@/components/ui/badge";

interface UserRoleBadgeProps {
  role: string;
}

export const UserRoleBadge = ({ role }: UserRoleBadgeProps) => {
  let badgeVariant: "default" | "secondary" | "destructive" = "default";
  let displayRole = "Employé";
  
  switch (role) {
    case "admin":
      badgeVariant = "destructive";
      displayRole = "Administrateur";
      break;
    case "manager":
      badgeVariant = "secondary";
      displayRole = "Manager";
      break;
  }
  
  return <Badge variant={badgeVariant}>{displayRole}</Badge>;
};
