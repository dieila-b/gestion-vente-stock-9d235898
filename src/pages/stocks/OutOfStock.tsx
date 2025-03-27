
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useStockStatistics } from "@/hooks/useStockStatistics";
import { CriticalProductsTable } from "@/components/stocks/CriticalProductsTable";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function OutOfStock() {
  const navigate = useNavigate();
  const { data: stockData = { stats: { inStock: 0, lowStock: 0, outOfStock: 0 }, criticalProducts: [] }, isLoading } = useStockStatistics();

  // Filtrer uniquement les produits qui ont un stock > 0
  const inStockProducts = stockData.criticalProducts.filter(
    product => product.totalQuantity > 0
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
            <h1 className="text-4xl font-bold text-gradient">Produits en Stock</h1>
            <p className="text-muted-foreground mt-2">
              Liste de tous les produits avec un stock positif
            </p>
          </div>
        </div>

        <CriticalProductsTable 
          products={inStockProducts}
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  );
}
