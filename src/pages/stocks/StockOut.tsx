
import { Card } from "@/components/ui/card";
import { StockMovementsTable } from "@/components/stocks/StockMovementsTable";
import { StockOutDialog } from "@/components/stocks/stock-out/StockOutDialog";
import { StockMovementsPrintDialog } from "@/components/stocks/StockMovementsPrintDialog";
import { useStockMovements } from "@/hooks/stocks/useStockMovements";

export default function StockOut() {
  const {
    movements,
    isLoading,
    warehouses,
    posLocations,
    products,
    createStockEntry: createStockExit
  } = useStockMovements('out');

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gradient">Sorties Stock</h1>
          <p className="text-muted-foreground mt-2">
            Historique des sorties de stock
          </p>
        </div>
        <div className="flex gap-4">
          <StockMovementsPrintDialog />
          <StockOutDialog 
            warehouses={warehouses} 
            posLocations={posLocations}
            products={products} 
            onSubmit={createStockExit} 
          />
        </div>
      </div>

      <Card className="enhanced-glass p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gradient">Liste des Sorties</h2>
          </div>

          <StockMovementsTable 
            movements={movements}
            isLoading={isLoading}
            type="out"
          />
        </div>
      </Card>
    </div>
  );
}
