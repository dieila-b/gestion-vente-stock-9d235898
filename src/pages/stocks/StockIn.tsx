
import { Card } from "@/components/ui/card";
import { StockMovementsTable } from "@/components/stocks/StockMovementsTable";
import { StockEntryForm } from "@/components/stocks/StockEntryForm";
import { StockMovementsPrintDialog } from "@/components/stocks/StockMovementsPrintDialog";
import { useStockMovements } from "@/hooks/stocks/useStockMovements";
import { StockMovement } from "@/hooks/stocks/useStockMovementTypes";

export default function StockIn() {
  const {
    movements,
    isLoading,
    warehouses,
    products,
    createStockEntry
  } = useStockMovements('in');

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gradient">Entrées Stock</h1>
          <p className="text-muted-foreground mt-2">
            Historique des entrées de stock
          </p>
        </div>
        <div className="flex gap-4">
          <StockMovementsPrintDialog />
          <StockEntryForm 
            warehouses={warehouses} 
            products={products} 
            onSubmit={createStockEntry} 
          />
        </div>
      </div>

      <Card className="enhanced-glass p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gradient">Liste des Entrées</h2>
          </div>

          <StockMovementsTable 
            movements={movements}
            isLoading={isLoading}
            type="in"
          />
        </div>
      </Card>
    </div>
  );
}
