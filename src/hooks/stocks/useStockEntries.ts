
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StockEntryForm } from "./useStockMovementTypes";
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";

export function useStockEntries() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const createStockEntryMutation = useMutation({
    mutationFn: async (data: StockEntryForm) => {
      setIsLoading(true);
      try {
        console.log("Creating stock entry:", data);
        const totalValue = data.quantity * data.unitPrice;
        
        // 1. Insérer le mouvement de stock entrée directement
        const { data: movementData, error: movementError } = await supabase
          .from('warehouse_stock_movements')
          .insert({
            warehouse_id: data.warehouseId,
            product_id: data.productId,
            quantity: data.quantity,
            unit_price: data.unitPrice,
            total_value: totalValue,
            type: 'in',
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
          .select('id, quantity, unit_price')
          .eq('product_id', data.productId)
          .eq('warehouse_id', data.warehouseId)
          .maybeSingle();
        
        if (existingStock) {
          // Le stock existe, mettre à jour la quantité
          const newQuantity = existingStock.quantity + data.quantity;
          
          // Calculer le nouveau prix unitaire moyen pondéré
          const oldValue = existingStock.quantity * existingStock.unit_price;
          const newValue = data.quantity * data.unitPrice;
          const newTotalValue = oldValue + newValue;
          const newUnitPrice = newTotalValue / newQuantity;
          
          const { error: updateError } = await supabase
            .from('warehouse_stock')
            .update({
              quantity: newQuantity,
              unit_price: newUnitPrice,
              total_value: newTotalValue,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingStock.id);
          
          if (updateError) {
            throw new Error(`Erreur lors de la mise à jour du stock: ${updateError.message}`);
          }
        } else {
          // Le stock n'existe pas, créer une nouvelle entrée
          const { error: insertError } = await supabase
            .from('warehouse_stock')
            .insert({
              id: uuidv4(),
              product_id: data.productId,
              warehouse_id: data.warehouseId,
              quantity: data.quantity,
              unit_price: data.unitPrice,
              total_value: totalValue,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (insertError) {
            throw new Error(`Erreur lors de la création du stock: ${insertError.message}`);
          }
        }

        return movementData;
      } catch (error: any) {
        console.error("Error creating stock entry:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      toast({
        title: "Entrée de stock réussie",
        description: "L'entrée de stock a été enregistrée avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse-stock'] });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `L'entrée de stock a échoué: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const createStockEntry = async (data: StockEntryForm) => {
    return createStockEntryMutation.mutateAsync(data);
  };

  return {
    createStockEntry,
    isLoading,
  };
}
