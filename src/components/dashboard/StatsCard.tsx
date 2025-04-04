
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import CountUp from "react-countup";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  onClick?: () => void;
}

export function StatsCard({ title, value, icon: Icon, trend, className, onClick }: StatsCardProps) {
  // Function to extract numeric value from string (e.g. "15,890,000 FG" -> 15890000)
  const extractNumber = (val: string | number): number => {
    if (typeof val === "number") return val;
    return parseFloat(val.replace(/[^0-9.-]+/g, ""));
  };

  // Function to get the suffix (e.g. "15,890,000 FG" -> "FG")
  const getSuffix = (val: string | number): string => {
    if (typeof val === "number") return "";
    const match = val.match(/[^0-9.-]+$/);
    return match ? match[0].trim() : "";
  };

  return (
    <Card 
      className={`p-4 card-hover backdrop-blur-xl transform transition-all duration-300 ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between relative overflow-hidden">
        <div className="z-10">
          <p className="text-xs text-muted-foreground font-medium">{title}</p>
          <h3 className="text-lg font-bold mt-1">
            {typeof value === "string" && value.includes("FG") ? (
              value
            ) : (
              <CountUp
                end={extractNumber(value)}
                duration={2}
                separator=","
                decimal="."
                decimals={0}
                suffix={` ${getSuffix(value)}`}
                className="tabular-nums text-lg"
              />
            )}
          </h3>
          {trend && (
            <p 
              className={`text-xs mt-1 flex items-center gap-1 ${
                trend.isPositive ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {trend.isPositive ? '↑ ' : '↓ '}
              {trend.value}%
            </p>
          )}
        </div>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center relative z-10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl"></div>
      </div>
    </Card>
  );
}
