
import { Badge } from "@/components/ui/badge";

type StatusVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info";

interface StatusConfig {
  label: string;
  variant: StatusVariant;
}

interface StatusMapType {
  [key: string]: StatusConfig;
}

interface StatusBadgeProps {
  status: string;
  statusMap: StatusMapType;
}

export function StatusBadge({ status, statusMap }: StatusBadgeProps) {
  const config = statusMap[status] || { label: status, variant: "default" };
  
  return (
    <Badge variant={config.variant as any}>
      {config.label}
    </Badge>
  );
}
