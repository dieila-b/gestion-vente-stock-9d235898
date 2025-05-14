
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StockEntryForm } from "./useStockMovementTypes";
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";

export function useStockExits() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const createStockExitMutation = useMutation({
    mutationFn: async (data: StockEntryForm) => {
      setIsLoading(true);
      try {
        console.log("Creating stock exit:", data);
        const totalValue = data.quantity * data.unitPrice;
        
        // 1. Insérer le mouvement de stock sortie directement
        const { data: movementData, error: movementError } = await supabase
          .from('warehouse_stock_movements')
          .insert({
            warehouse_id: data.warehouseId,
            product_id: data.productId,
            quantity: data.quantity,
            unit_price: data.unitPrice,
            total_value: totalValue,
            type: 'out',
            reason: data.reason
          })
          .select()
          .single();

        if (movementError) {
          throw new Error(`Erreur lors de la création du mouvement: ${movementError.message}`);
        }
        
        // 2. Mettre à jour le stock de l'entrepôt en utilisant la fonction bypass_update_warehouse_stock
        // qui contourne les politiques RLS
        const { data: stockUpdateData, error: stockUpdateError } = await supabase
          .rpc('bypass_update_warehouse_stock', {
            warehouse_id: data.warehouseId,
            product_id: data.productId,
            quantity: data.quantity,
            unit_price: data.unitPrice
          });
          
        if (stockUpdateError) {
          throw new Error(`Erreur lors de la mise à jour du stock: ${stockUpdateError.message}`);
        }

        // Return true to indicate success
        return true;
      } catch (error: any) {
        console.error("Error creating stock exit:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      toast({
        title: "Sortie de stock réussie",
        description: "La sortie de stock a été enregistrée avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse-stock'] });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `La sortie de stock a échoué: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const createStockExit = async (data: StockEntryForm): Promise<boolean> => {
    try {
      await createStockExitMutation.mutateAsync(data);
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    createStockExit,
    isLoading,
  };
}
