
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";

interface MovementTypeIconProps {
  type: "in" | "out";
  size?: number;
}

export function MovementTypeIcon({ type, size = 4 }: MovementTypeIconProps) {
  if (type === "in") {
    return <ArrowUpCircle className={`h-${size} w-${size} text-green-500`} />;
  }
  
  return <ArrowDownCircle className={`h-${size} w-${size} text-red-500`} />;
}
