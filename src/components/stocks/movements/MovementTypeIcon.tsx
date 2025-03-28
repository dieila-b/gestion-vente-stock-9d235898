
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

interface MovementTypeIconProps {
  type: 'in' | 'out';
  size?: number;
  className?: string;
}

export function MovementTypeIcon({ type, size = 4, className = "" }: MovementTypeIconProps) {
  if (type === 'in') {
    return <ArrowUpCircle className={`h-${size} w-${size} text-green-500 ${className}`} />;
  }
  
  return <ArrowDownCircle className={`h-${size} w-${size} text-amber-500 ${className}`} />;
}
