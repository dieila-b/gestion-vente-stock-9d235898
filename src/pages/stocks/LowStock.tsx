
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useStockStatistics } from "@/hooks/useStockStatistics";
import { CriticalProductsTable } from "@/components/stocks/CriticalProductsTable";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LowStock() {
  const navigate = useNavigate();
  const { data: stockData = { stats: { inStock: 0, lowStock: 0, outOfStock: 0 }, criticalProducts: [] }, isLoading } = useStockStatistics();

  // Filtrer uniquement les produits en stock faible
  const lowStockProducts = stockData.criticalProducts.filter(
    product => product.status === 'low_stock'
  );

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 lg:p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/stock-status')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <h1 className="text-4xl font-bold text-gradient">Produits en Stock Faible</h1>
            <p className="text-muted-foreground mt-2">
              Liste des produits dont le stock est faible
            </p>
          </div>
        </div>

        <CriticalProductsTable 
          products={lowStockProducts}
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  );
}
