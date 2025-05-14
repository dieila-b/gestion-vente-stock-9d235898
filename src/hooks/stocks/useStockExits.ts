
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StockEntryForm } from "./useStockMovementTypes";
import { toast } from "@/components/ui/use-toast";

export function useStockExits() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const createStockExitMutation = useMutation({
    mutationFn: async (data: StockEntryForm) => {
      setIsLoading(true);
      try {
        console.log("Creating stock exit with data:", data);
        const totalValue = data.quantity * data.unitPrice;
        
        // 1. Check if there is enough stock in the warehouse
        const { data: existingStock, error: stockCheckError } = await supabase
          .from('warehouse_stock')
          .select('id, quantity, unit_price, total_value')
          .eq('warehouse_id', data.warehouseId)
          .eq('product_id', data.productId)
          .maybeSingle();
        
        if (stockCheckError) {
          console.error("Error checking stock availability:", stockCheckError);
          throw new Error(`Erreur lors de la vérification du stock: ${stockCheckError.message}`);
        }
        
        if (!existingStock) {
          console.error("Product not found in warehouse");
          throw new Error('Ce produit n\'existe pas dans l\'entrepôt sélectionné.');
        }
        
        if (existingStock.quantity < data.quantity) {
          console.error("Insufficient stock", {
            available: existingStock.quantity,
            requested: data.quantity
          });
          throw new Error(`Stock insuffisant. Quantité disponible: ${existingStock.quantity}`);
        }
        
        // 2. Insert the stock movement
        const { data: movementData, error: movementError } = await supabase
          .rpc('bypass_insert_stock_movement', {
            warehouse_id: data.warehouseId,
            product_id: data.productId,
            quantity: data.quantity,
            unit_price: data.unitPrice,
            total_value: totalValue,
            movement_type: 'out',
            reason: data.reason
          });

        if (movementError) {
          console.error("Error creating movement:", movementError);
          throw new Error(`Erreur lors de la création du mouvement: ${movementError.message}`);
        }
        
        console.log("Successfully created stock exit movement:", movementData);
        
        // 3. Update the warehouse stock
        const newQuantity = existingStock.quantity - data.quantity;
        const newTotalValue = newQuantity * existingStock.unit_price;
        
        console.log("Updating stock for exit:", {
          id: existingStock.id,
          oldQuantity: existingStock.quantity,
          newQuantity,
          totalValue: newTotalValue
        });
        
        const { error: updateError } = await supabase
          .from('warehouse_stock')
          .update({
            quantity: newQuantity,
            total_value: newTotalValue,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingStock.id);
          
        if (updateError) {
          console.error("Error updating stock after exit:", updateError);
          throw new Error(`Erreur lors de la mise à jour du stock: ${updateError.message}`);
        }
        
        console.log("Stock successfully updated after exit");
        
        return true;
      } catch (error: any) {
        console.error("Error in createStockExit:", error);
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
      // Invalidate all relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse-stock'] });
      console.log("Stock exit successful - Queries invalidated");
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `La sortie de stock a échoué: ${error.message}`,
        variant: "destructive",
      });
      console.error("Stock exit failed:", error);
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
