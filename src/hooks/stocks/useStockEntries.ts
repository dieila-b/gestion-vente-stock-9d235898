
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StockEntryForm } from "./useStockMovementTypes";
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/utils/db-core";

export function useStockEntries() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const createStockEntryMutation = useMutation({
    mutationFn: async (data: StockEntryForm) => {
      setIsLoading(true);
      try {
        console.log("Creating stock entry:", data);
        const totalValue = data.quantity * data.unitPrice;
        
        // 1. Insert the stock movement directly using the bypass function
        const { data: movementData, error: movementError } = await supabase
          .rpc('bypass_insert_stock_movement', {
            warehouse_id: data.warehouseId,
            product_id: data.productId,
            quantity: data.quantity,
            unit_price: data.unitPrice,
            total_value: totalValue,
            movement_type: 'in',
            reason: data.reason
          });

        if (movementError) {
          throw new Error(`Erreur lors de la création du mouvement: ${movementError.message}`);
        }
        
        // 2. Check if the product exists in the warehouse
        const { data: existingStock } = await supabase
          .from('warehouse_stock')
          .select('id, quantity, unit_price')
          .eq('product_id', data.productId)
          .eq('warehouse_id', data.warehouseId)
          .maybeSingle();
        
        if (existingStock) {
          // The stock exists, update the quantity
          const newQuantity = existingStock.quantity + data.quantity;
          
          // Calculate the new weighted average unit price
          const oldValue = existingStock.quantity * existingStock.unit_price;
          const newValue = data.quantity * data.unitPrice;
          const newTotalValue = oldValue + newValue;
          const newUnitPrice = newTotalValue / newQuantity;
          
          // Update with the db utility function that handles RLS
          await db.update(
            'warehouse_stock',
            {
              quantity: newQuantity,
              unit_price: newUnitPrice,
              total_value: newTotalValue,
              updated_at: new Date().toISOString()
            },
            'id',
            existingStock.id
          );
        } else {
          // The stock doesn't exist, create a new entry
          await db.insert('warehouse_stock', {
            id: uuidv4(),
            product_id: data.productId,
            warehouse_id: data.warehouseId,
            quantity: data.quantity,
            unit_price: data.unitPrice,
            total_value: totalValue,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }

        // Return true to indicate success
        return true;
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

  const createStockEntry = async (data: StockEntryForm): Promise<boolean> => {
    try {
      await createStockEntryMutation.mutateAsync(data);
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    createStockEntry,
    isLoading,
  };
}
