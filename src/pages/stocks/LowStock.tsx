
import { Card, CardContent } from "@/components/ui/card";
import { StockTable } from "@/components/stocks/StockTable";
import { AlertTriangle } from "lucide-react";
import { useStockStatistics } from "@/hooks/useStockStatistics";
import { EmptyState } from "@/components/ui/empty-state";

export default function LowStock() {
  const { warehouseStock, isLoadingWarehouseStock } = useStockStatistics();
  
  // Consider low stock as items with quantity between 1 and 5
  const lowStockItems = Array.isArray(warehouseStock) 
    ? warehouseStock.filter(item => item.quantity > 0 && item.quantity <= 5)
    : [];

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Stock Faible</h1>
      
      <Card>
        <CardContent className="p-6">
          {isLoadingWarehouseStock ? (
            <div className="flex justify-center items-center h-60">Loading...</div>
          ) : lowStockItems.length === 0 ? (
            <EmptyState
              icon={<AlertTriangle className="h-10 w-10 text-muted-foreground" />}
              title="Aucun article en stock faible"
              description="Aucun produit n'est en quantité limitée."
            />
          ) : (
            <StockTable items={lowStockItems} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
