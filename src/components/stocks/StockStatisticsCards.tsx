
import { StatsCard } from "@/components/dashboard/StatsCard";
import { PackageCheck, AlertTriangle, PackageX } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StockStatisticsCardsProps {
  isLoading: boolean;
  stats: {
    inStock: number;
    lowStock: number;
    outOfStock: number;
  };
}

export function StockStatisticsCards({ isLoading, stats }: StockStatisticsCardsProps) {
  const navigate = useNavigate();

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div 
        onClick={() => navigate('/stocks/main')}
        className="cursor-pointer hover:scale-105 transition-transform"
      >
        <StatsCard
          title="Total Produits en Stock"
          value={isLoading ? "..." : stats.inStock.toString()}
          icon={PackageCheck}
          trend={{ 
            value: 0,
            isPositive: stats.inStock > 0 
          }}
        />
      </div>
      <div
        onClick={() => navigate('/stocks/low-stock')}
        className="cursor-pointer hover:scale-105 transition-transform"
      >
        <StatsCard
          title="Produits en Stock Faible"
          value={isLoading ? "..." : stats.lowStock.toString()}
          icon={AlertTriangle}
          trend={{ 
            value: 0,
            isPositive: false 
          }}
        />
      </div>
      <div 
        onClick={() => navigate('/stocks/out-of-stock')}
        className="cursor-pointer hover:scale-105 transition-transform"
      >
        <StatsCard
          title="Produits en Rupture"
          value={isLoading ? "..." : stats.outOfStock.toString()}
          icon={PackageX}
          trend={{ 
            value: 0,
            isPositive: false 
          }}
        />
      </div>
    </div>
  );
}
