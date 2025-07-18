
import { Card } from "@/components/ui/card";
import { StockMovementsTable } from "@/components/stocks/StockMovementsTable";
import { StockEntryDialog } from "@/components/stocks/stock-entry/StockEntryDialog";
import { StockMovementsPrintDialog } from "@/components/stocks/StockMovementsPrintDialog";
import { useStockMovements } from "@/hooks/stocks/useStockMovements";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function StockIn() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    movements,
    isLoading,
    warehouses,
    posLocations,
    products,
    createStockEntry,
    refetch
  } = useStockMovements('in');

  // Chargement initial des données
  useEffect(() => {
    console.log("StockIn component mounted - fetching initial data");
    queryClient.invalidateQueries({ queryKey: ['stock-movements', 'in'] });
    queryClient.invalidateQueries({ queryKey: ['stock_principal'] });
  }, [queryClient]);

  const handleRefresh = async () => {
    console.log("Manual refresh requested");
    setIsRefreshing(true);
    toast.info("Actualisation en cours", {
      description: "Chargement des données de mouvements de stock..."
    });
    
    try {
      // Invalidate relevant queries
      await queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      await queryClient.invalidateQueries({ queryKey: ['warehouse-stock'] });
      await queryClient.invalidateQueries({ queryKey: ['catalog'] });
      await queryClient.invalidateQueries({ queryKey: ['stock_principal'] });
      
      // Use the refetch function from useStockMovements for a complete refresh
      await refetch();
      
      toast.success("Données actualisées", {
        description: "Les mouvements de stock ont été rechargés."
      });
    } catch (error) {
      toast.error("Erreur d'actualisation", {
        description: "Impossible de recharger les données. Veuillez réessayer."
      });
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStockEntrySubmit = async (data: any) => {
    console.log("Stock entry submission from StockIn component:", data);
    try {
      const result = await createStockEntry(data);
      
      if (result) {
        console.log("Stock entry created successfully, refreshing data");
        toast.success("Entrée de stock créée", {
          description: "L'entrée de stock a été enregistrée avec succès."
        });
        // Refresh data
        await handleRefresh();
        return true;
      } else {
        console.error("Stock entry creation failed");
        toast.error("Échec de l'entrée de stock", {
          description: "Impossible de créer l'entrée de stock. Veuillez réessayer."
        });
        return false;
      }
    } catch (error) {
      console.error("Exception during stock entry creation:", error);
      toast.error("Erreur", {
        description: `Erreur lors de l'entrée de stock: ${error instanceof Error ? error.message : String(error)}`
      });
      return false;
    }
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
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Actualisation...' : 'Actualiser'}
          </Button>
          <StockMovementsPrintDialog />
          <StockEntryDialog 
            warehouses={warehouses} 
            posLocations={posLocations}
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
