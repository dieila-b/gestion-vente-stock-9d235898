
import { Card, CardContent } from "@/components/ui/card";
import { StockTable } from "@/components/stocks/StockTable";
import { CircleAlert } from "lucide-react";
import { useStockStatistics } from "@/hooks/useStockStatistics";
import { EmptyState } from "@/components/ui/empty-state";

export default function LowStock() {
  const { warehouseStock, isLoadingWarehouseStock } = useStockStatistics();
  
  const lowStockItems = Array.isArray(warehouseStock) 
    ? warehouseStock.filter(item => item.quantity > 0 && item.quantity < 10)
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
              icon={<CircleAlert className="h-10 w-10 text-muted-foreground" />}
              title="Aucun article en stock faible"
              description="Tous les articles ont une quantité suffisante en stock."
            />
          ) : (
            <StockTable items={lowStockItems} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
