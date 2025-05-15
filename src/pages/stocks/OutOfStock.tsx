
import { Card, CardContent } from "@/components/ui/card";
import { StockTable } from "@/components/stocks/StockTable";
import { CircleAlert } from "lucide-react";
import { useStockStatistics, StockItem } from "@/hooks/useStockStatistics";
import { EmptyState } from "@/components/ui/empty-state";

export default function OutOfStock() {
  const { warehouseStock, isLoadingWarehouseStock } = useStockStatistics();
  
  const outOfStockItems = Array.isArray(warehouseStock) 
    ? warehouseStock.filter(item => item.quantity === 0)
    : [];

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Rupture de Stock</h1>
      
      <Card>
        <CardContent className="p-6">
          {isLoadingWarehouseStock ? (
            <div className="flex justify-center items-center h-60">Loading...</div>
          ) : outOfStockItems.length === 0 ? (
            <EmptyState
              icon={<CircleAlert className="h-10 w-10 text-muted-foreground" />}
              title="Aucun article en rupture de stock"
              description="Tous les articles ont du stock disponible."
            />
          ) : (
            <StockTable items={outOfStockItems} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
