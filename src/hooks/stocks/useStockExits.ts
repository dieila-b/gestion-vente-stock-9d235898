
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
        
        // 2. Mettre à jour le stock de l'entrepôt
        // D'abord vérifier si le produit existe déjà dans l'entrepôt
        const { data: existingStock } = await supabase
          .from('warehouse_stock')
          .select('id, quantity')
          .eq('product_id', data.productId)
          .eq('warehouse_id', data.warehouseId)
          .maybeSingle();
        
        if (existingStock) {
          // Le stock existe, mettre à jour la quantité
          const newQuantity = Math.max(0, existingStock.quantity - data.quantity);
          
          const { error: updateError } = await supabase
            .from('warehouse_stock')
            .update({
              quantity: newQuantity,
              unit_price: data.unitPrice,
              total_value: newQuantity * data.unitPrice,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingStock.id);
          
          if (updateError) {
            throw new Error(`Erreur lors de la mise à jour du stock: ${updateError.message}`);
          }
        } else {
          // Le stock n'existe pas, créer une nouvelle entrée avec quantité 0
          // Pour les sorties, nous ne devrions normalement pas créer une nouvelle entrée
          // car il devrait déjà y avoir du stock, mais au cas où:
          const { error: insertError } = await supabase
            .from('warehouse_stock')
            .insert({
              id: uuidv4(),
              product_id: data.productId,
              warehouse_id: data.warehouseId,
              quantity: 0,
              unit_price: data.unitPrice,
              total_value: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (insertError) {
            throw new Error(`Erreur lors de la création du stock: ${insertError.message}`);
          }
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
