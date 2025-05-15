
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StockEntryForm } from "./useStockMovementTypes";
import { toast } from "sonner";

export function useStockEntries() {
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
        
        const totalValue = data.quantity * data.unitPrice;
        
        // 1. Insert the stock movement
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
          console.error("Error creating movement:", movementError);
          throw new Error(`Erreur lors de la création du mouvement: ${movementError.message}`);
        }
        
        console.log("Successfully created stock movement:", movementData);
        
        // 2. Check if stock exists for this product in this warehouse
        const { data: existingStock, error: stockCheckError } = await supabase
          .from('warehouse_stock')
          .select('id, quantity, unit_price, total_value')
          .eq('warehouse_id', data.warehouseId)
          .eq('product_id', data.productId)
          .maybeSingle();
        
        if (stockCheckError) {
          console.error("Error checking existing stock:", stockCheckError);
          throw new Error(`Erreur lors de la vérification du stock: ${stockCheckError.message}`);
        }
        
        // 3. Update or create stock entry
        if (existingStock) {
          // Calculate new values for existing stock (weighted average)
          const newQuantity = existingStock.quantity + data.quantity;
          const oldValue = existingStock.quantity * existingStock.unit_price;
          const newValue = data.quantity * data.unitPrice;
          const newTotalValue = oldValue + newValue;
          const newUnitPrice = newQuantity > 0 ? newTotalValue / newQuantity : data.unitPrice;
          
          console.log("Updating existing warehouse stock:", {
            id: existingStock.id,
            oldQuantity: existingStock.quantity,
            newQuantity,
            oldUnitPrice: existingStock.unit_price,
            newUnitPrice,
            oldTotalValue: existingStock.total_value,
            newTotalValue
          });
          
          // Update existing stock
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
            console.error("Error updating stock:", updateError);
            throw new Error(`Erreur lors de la mise à jour du stock: ${updateError.message}`);
          }
          
          console.log("Stock successfully updated");
        } else {
          // Create new stock entry
          console.log("Creating new warehouse stock entry:", {
            warehouseId: data.warehouseId,
            productId: data.productId,
            quantity: data.quantity,
            unitPrice: data.unitPrice,
            totalValue
          });
          
          const { error: insertError } = await supabase
            .from('warehouse_stock')
            .insert({
              warehouse_id: data.warehouseId,
              product_id: data.productId,
              quantity: data.quantity,
              unit_price: data.unitPrice,
              total_value: totalValue
            });
            
          if (insertError) {
            console.error("Error creating stock:", insertError);
            throw new Error(`Erreur lors de la création du stock: ${insertError.message}`);
          }
          
          console.log("New stock entry successfully created");
        }

        // 4. Update the catalog product stock total
        try {
          // First, get current stock value from catalog
          const { data: productData, error: productError } = await supabase
            .from('catalog')
            .select('stock')
            .eq('id', data.productId)
            .single();

          if (productError) {
            console.error("Error getting current product stock:", productError);
            throw productError;
          }

          // Calculate new stock value
          const currentStock = productData?.stock || 0;
          const newStock = currentStock + data.quantity;
          console.log(`Updating catalog product ${data.productId} stock from ${currentStock} to ${newStock}`);

          // Update the catalog stock
          const { error: updateCatalogError } = await supabase
            .from('catalog')
            .update({ 
              stock: newStock,
              updated_at: new Date().toISOString()
            })
            .eq('id', data.productId);

          if (updateCatalogError) {
            console.error("Error updating catalog product stock:", updateCatalogError);
            throw updateCatalogError;
          }
              
          console.log(`Updated catalog product stock from ${currentStock} to ${newStock}`);
        } catch (err) {
          console.error("Error updating catalog product stock:", err);
          throw new Error(`Erreur lors de la mise à jour du stock du produit: ${err instanceof Error ? err.message : String(err)}`);
        }

        return true;
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
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse-stock'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse-stock-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
      queryClient.invalidateQueries({ queryKey: ['stock-stats'] });
      console.log("Stock entry successful - All relevant queries invalidated");
    },
    onError: (error) => {
      toast.error("Erreur", {
        description: `L'entrée de stock a échoué: ${error instanceof Error ? error.message : String(error)}`
      });
      console.error("Stock entry failed:", error);
    },
  });

  const createStockEntry = async (data: StockEntryForm): Promise<boolean> => {
    try {
      console.log("Creating stock entry via mutation with data:", data);
      await createStockEntryMutation.mutateAsync(data);
      return true;
    } catch (error) {
      console.error("Error in createStockEntry wrapper:", error);
      return false;
    }
  };

  return {
    createStockEntry,
    isLoading: isLoading || createStockEntryMutation.isPending,
  };
}
