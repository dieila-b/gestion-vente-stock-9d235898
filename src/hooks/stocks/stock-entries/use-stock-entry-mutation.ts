
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
        console.log("Création d'une entrée de stock avec les données:", data);
        
        // Validation des données requises
        if (!data.warehouseId || !data.productId) {
          throw new Error("L'entrepôt et le produit sont obligatoires");
        }
        
        if (data.quantity <= 0) {
          throw new Error("La quantité doit être positive");
        }

        // Création de l'entrée de stock
        console.log("Calling createStockEntryInDb with validated data...");
        const result = await createStockEntryInDb(data);
        console.log("createStockEntryInDb result:", result);
        
        if (!result) {
          throw new Error("L'entrée de stock a échoué sans erreur spécifique");
        }
        
        return result;
      } catch (error: any) {
        console.error("Erreur dans createStockEntry:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      console.log("Entrée de stock réussie - Invalidation des requêtes");
      toast.success("Entrée de stock réussie", {
        description: "L'entrée de stock a été enregistrée avec succès."
      });
      // Invalider toutes les requêtes pertinentes pour rafraîchir les données
      invalidateStockQueries(queryClient);
      console.log("Entrée de stock réussie - Toutes les requêtes pertinentes invalidées");
    },
    onError: (error) => {
      console.error("Échec de l'entrée de stock:", error);
      toast.error("Erreur", {
        description: `L'entrée de stock a échoué: ${error instanceof Error ? error.message : String(error)}`
      });
    },
  });

  return {
    createStockEntryMutation,
    isLoading: isLoading || createStockEntryMutation.isPending
  };
}

// Fonction extraite pour invalider les requêtes liées au stock
export function invalidateStockQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
  queryClient.invalidateQueries({ queryKey: ['warehouse-stock'] });
  queryClient.invalidateQueries({ queryKey: ['warehouse-stock-statistics'] });
  queryClient.invalidateQueries({ queryKey: ['catalog'] });
  queryClient.invalidateQueries({ queryKey: ['stock-stats'] });
  queryClient.invalidateQueries({ queryKey: ['stock_principal'] });
  
  // Ajouter un délai pour permettre à la base de données de se mettre à jour
  setTimeout(() => {
    queryClient.refetchQueries({ queryKey: ['stock-movements'] });
    queryClient.refetchQueries({ queryKey: ['warehouse-stock'] });
    queryClient.refetchQueries({ queryKey: ['stock_principal'] });
  }, 1000);
}
