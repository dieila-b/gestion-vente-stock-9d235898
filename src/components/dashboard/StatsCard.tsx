
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
  // Function to extract numeric value from string (e.g. "15,890,000 GNF" -> 15890000)
  const extractNumber = (val: string | number): number => {
    if (typeof val === "number") return val;
    return parseFloat(val.replace(/[^0-9.-]+/g, ""));
  };

  // Function to get the suffix (e.g. "15,890,000 GNF" -> "GNF")
  const getSuffix = (val: string | number): string => {
    if (typeof val === "number") return "";
    const match = val.match(/[^0-9.-]+$/);
    return match ? match[0].trim() : "";
  };

  // Format the number as a string with proper formatting
  const formatNumberWithSeparator = (num: number): string => {
    return num.toLocaleString('fr-FR', {
      minimumFractionDigits: value.toString().includes(".") ? 1 : 0,
      maximumFractionDigits: value.toString().includes(".") ? 1 : 0
    });
  };

  const numericValue = extractNumber(value);
  const suffixText = getSuffix(value);
  
  // Format trend value
  const formattedTrendValue = trend?.value?.toFixed(1);
  const trendPrefix = trend?.isPositive ? '↑ ' : '↓ ';

  return (
    <Card 
      className={`enhanced-glass p-4 card-hover animate-float group backdrop-blur-xl transform transition-all duration-300 hover:scale-105 ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between relative overflow-hidden">
        <div className="animate-slide-in z-10">
          <p className="text-xs text-muted-foreground font-medium">{title}</p>
          <h3 className="text-lg font-bold mt-1 group-hover:text-gradient">
            <CountUp 
              end={numericValue}
              className="tabular-nums text-lg"
            />
            {suffixText && <span className="ml-1">{suffixText}</span>}
          </h3>
          {trend && (
            <p 
              className={`text-xs mt-1 flex items-center gap-1 ${
                trend.isPositive ? 'text-green-400' : 'text-red-400'
              }`}
            >
              <span className="tabular-nums">
                {trendPrefix}{formattedTrendValue}%
              </span>
            </p>
          )}
        </div>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:animate-glow relative z-10">
          <Icon className="h-4 w-4 text-primary group-hover:neon-glow" />
        </div>
        {/* 3D Effect Background Elements */}
        <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl transform group-hover:scale-150 transition-transform duration-500"></div>
        <div className="absolute -left-4 -top-4 h-24 w-24 bg-gradient-to-br from-primary/3 to-transparent rounded-full blur-xl transform group-hover:scale-150 transition-transform duration-500"></div>
      </div>
    </Card>
  );
}
