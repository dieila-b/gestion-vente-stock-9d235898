
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StockEntryForm } from "./useStockMovementTypes";
import { toast } from "sonner";
import { db } from "@/utils/db-core";

export function useStockExits() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const createStockExitMutation = useMutation({
    mutationFn: async (data: StockEntryForm) => {
      setIsLoading(true);
      
      try {
        console.log("Creating stock exit with data:", data);
        
        if (!data.warehouseId || !data.productId) {
          throw new Error("L'entrepôt et le produit sont obligatoires");
        }
        
        if (data.quantity <= 0) {
          throw new Error("La quantité doit être positive");
        }
        
        // Check if there is enough stock
        const { data: stockData, error: stockCheckError } = await supabase
          .from('warehouse_stock')
          .select('id, quantity, unit_price')
          .eq('warehouse_id', data.warehouseId)
          .eq('product_id', data.productId)
          .maybeSingle();
        
        if (stockCheckError) {
          console.error("Error checking stock:", stockCheckError);
          throw new Error(`Erreur lors de la vérification du stock: ${stockCheckError.message}`);
        }
        
        if (!stockData) {
          throw new Error("Pas de stock disponible pour ce produit dans cet entrepôt");
        }
        
        if (stockData.quantity < data.quantity) {
          throw new Error(`Stock insuffisant: ${stockData.quantity} disponible(s)`);
        }
        
        const totalValue = data.quantity * (data.unitPrice || stockData.unit_price);
        
        // Create the movement
        const { data: movementData, error: movementError } = await supabase
          .from('warehouse_stock_movements')
          .insert({
            warehouse_id: data.warehouseId,
            product_id: data.productId,
            quantity: data.quantity,
            unit_price: data.unitPrice || stockData.unit_price,
            total_value: totalValue,
            type: 'out',
            reason: data.reason
          })
          .select();
        
        if (movementError) {
          console.error("Error creating movement:", movementError);
          throw new Error(`Erreur lors de la création du mouvement: ${movementError.message}`);
        }
        
        console.log("Successfully created stock exit movement:", movementData);
        
        // Update the stock
        const newQuantity = stockData.quantity - data.quantity;
        const newTotalValue = newQuantity * stockData.unit_price;
        
        console.log("Updating warehouse stock:", {
          id: stockData.id,
          oldQuantity: stockData.quantity,
          newQuantity,
          totalValue: newTotalValue
        });
        
        // Use db utility to update warehouse_stock with RLS bypass
        const updateResult = await db.update(
          'warehouse_stock',
          {
            quantity: newQuantity,
            total_value: newTotalValue,
            updated_at: new Date().toISOString()
          },
          'id',
          stockData.id
        );
          
        if (!updateResult) {
          console.error("Error updating stock");
          throw new Error("Erreur lors de la mise à jour du stock");
        }
        
        console.log("Stock successfully updated");
        
        // Update the catalog product stock total
        try {
          const { data: productData, error: productError } = await supabase
            .from('catalog')
            .select('stock')
            .eq('id', data.productId)
            .single();

          if (productError) {
            console.error("Error getting product stock:", productError);
            throw productError;
          }
          
          const currentStock = productData?.stock || 0;
          const newStock = Math.max(0, currentStock - data.quantity);
          
          // Use db utility to update catalog with RLS bypass
          const updateCatalogResult = await db.update(
            'catalog',
            { 
              stock: newStock,
              updated_at: new Date().toISOString()
            },
            'id',
            data.productId
          );
          
          if (!updateCatalogResult) {
            console.error("Error updating catalog stock");
            throw new Error("Erreur lors de la mise à jour du stock du produit");
          }
          
          console.log(`Updated catalog product stock from ${currentStock} to ${newStock}`);
        } catch (err) {
          console.error("Error updating catalog stock:", err);
          // We continue even if catalog update fails
        }
        
        return true;
      } catch (error: any) {
        console.error("Error in createStockExit:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      toast.success("Sortie de stock réussie", {
        description: "La sortie de stock a été enregistrée avec succès."
      });
      // Invalidate all relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse-stock'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse-stock-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
      queryClient.invalidateQueries({ queryKey: ['stock-stats'] });
    },
    onError: (error) => {
      toast.error("Erreur", {
        description: `La sortie de stock a échoué: ${error instanceof Error ? error.message : String(error)}`
      });
      console.error("Stock exit failed:", error);
    },
  });

  const createStockExit = async (data: StockEntryForm): Promise<boolean> => {
    try {
      await createStockExitMutation.mutateAsync(data);
      return true;
    } catch (error) {
      console.error("Error in createStockExit wrapper:", error);
      return false;
    }
  };

  return {
    createStockExit,
    isLoading: isLoading || createStockExitMutation.isPending,
  };
}
