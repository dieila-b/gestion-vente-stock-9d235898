
import { Card } from "@/components/ui/card";
import { StockMovementsTable } from "@/components/stocks/StockMovementsTable";
import { StockEntryDialog } from "@/components/stocks/stock-entry/StockEntryDialog";
import { StockMovementsPrintDialog } from "@/components/stocks/StockMovementsPrintDialog";
import { useStockMovements } from "@/hooks/stocks/useStockMovements";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

export default function StockIn() {
  const queryClient = useQueryClient();
  const {
    movements,
    isLoading,
    warehouses,
    products,
    createStockEntry,
    refetch
  } = useStockMovements('in');

  // Chargement initial des données
  useEffect(() => {
    console.log("StockIn component mounted - fetching initial data");
    queryClient.invalidateQueries({ queryKey: ['stock-movements', 'in'] });
  }, [queryClient]);

  const handleRefresh = () => {
    console.log("Manual refresh requested");
    toast.info("Actualisation en cours", {
      description: "Chargement des données de mouvements de stock..."
    });
    
    // Invalidate relevant queries
    queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
    queryClient.invalidateQueries({ queryKey: ['warehouse-stock'] });
    queryClient.invalidateQueries({ queryKey: ['catalog'] });
    
    // Use the refetch function from useStockMovements for a complete refresh
    refetch();
  };

  const handleStockEntrySubmit = async (data: any) => {
    console.log("Stock entry submission from StockIn component:", data);
    const result = await createStockEntry(data);
    
    if (result) {
      console.log("Stock entry created successfully, refreshing data");
      // Automatic refresh handled by the mutation's onSuccess
    }
    
    return result;
  };

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
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
          <StockMovementsPrintDialog />
          <StockEntryDialog 
            warehouses={warehouses} 
            products={products} 
            onSubmit={handleStockEntrySubmit} 
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
