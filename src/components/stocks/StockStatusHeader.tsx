
import { Button } from "@/components/ui/button";
import { FileDown, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useStockStats } from "@/hooks/dashboard/useStockStats";

interface StockStatusHeaderProps {
  onRefresh?: () => void;
}

export function StockStatusHeader({ onRefresh }: StockStatusHeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { totalStock } = useStockStats();

  const handleRefresh = () => {
    if (onRefresh) {
      setIsRefreshing(true);
      onRefresh();
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-4xl font-bold text-gradient">État des Stocks</h1>
        <p className="text-muted-foreground mt-2">
          Visualisation en temps réel de vos stocks ({totalStock.toLocaleString()} articles)
        </p>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className="glass-effect hover:neon-glow"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
        <Button className="glass-effect hover:neon-glow">
          <FileDown className="w-4 h-4 mr-2" />
          Exporter les données
        </Button>
      </div>
    </div>
  );
}
