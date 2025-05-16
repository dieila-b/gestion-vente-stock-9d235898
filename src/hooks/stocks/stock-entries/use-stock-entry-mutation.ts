
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { StockEntryForm } from "../useStockMovementTypes";
import { createStockEntryInDb } from "./stock-entry-service";
import { toast } from "sonner";

export function useStockEntryMutation() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const createStockEntryMutation = useMutation({
    mutationFn: async (data: StockEntryForm) => {
      setIsLoading(true);
      try {
        console.log("Creating stock entry with data:", data);
        
        if (!data.warehouseId || !data.productId) {
          throw new Error("L'entrepôt et le produit sont obligatoires");
        }
        
        if (data.quantity <= 0) {
          throw new Error("La quantité doit être positive");
        }
        
        const result = await createStockEntryInDb(data);
        return result;
      } catch (error: any) {
        console.error("Error in createStockEntry:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      toast.success("Entrée de stock réussie", {
        description: "L'entrée de stock a été enregistrée avec succès."
      });
      // Invalidate all relevant queries to refresh data
      invalidateStockQueries(queryClient);
      console.log("Stock entry successful - All relevant queries invalidated");
    },
    onError: (error) => {
      toast.error("Erreur", {
        description: `L'entrée de stock a échoué: ${error instanceof Error ? error.message : String(error)}`
      });
      console.error("Stock entry failed:", error);
    },
  });

  return {
    createStockEntryMutation,
    isLoading
  };
}

// Extracted function to invalidate stock-related queries
export function invalidateStockQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
  queryClient.invalidateQueries({ queryKey: ['warehouse-stock'] });
  queryClient.invalidateQueries({ queryKey: ['warehouse-stock-statistics'] });
  queryClient.invalidateQueries({ queryKey: ['catalog'] });
  queryClient.invalidateQueries({ queryKey: ['stock-stats'] });
  queryClient.invalidateQueries({ queryKey: ['stock_principal'] });
}
