
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StockEntryForm } from "./useStockMovementTypes";

export function useStockEntries() {
  const queryClient = useQueryClient();

  const createStockEntry = async (data: StockEntryForm) => {
    try {
      console.log("Submitting stock entry:", data);
      
      // Calculate total value
      const totalValue = data.quantity * data.unitPrice;
      
      // Insérer directement dans la table au lieu d'utiliser la fonction bypass
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
        console.error("Error creating movement:", movementError);
        throw movementError;
      }
      
      console.log("Movement created successfully:", movementData);

      // Update warehouse stock quantities
      const { data: existingStock, error: stockQueryError } = await supabase
        .from('warehouse_stock')
        .select('id, quantity, unit_price')
        .eq('warehouse_id', data.warehouseId)
        .eq('product_id', data.productId)
        .maybeSingle();

      if (stockQueryError) {
        console.error("Error querying existing stock:", stockQueryError);
        throw stockQueryError;
      }

      if (existingStock) {
        // Update existing stock
        const newQuantity = existingStock.quantity + data.quantity;
        // Calculer une nouvelle valeur totale basée sur la somme
        const newTotalValue = newQuantity * data.unitPrice;
        
        console.log("Updating existing stock:", {
          id: existingStock.id,
          newQuantity,
          newTotalValue
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
          console.error("Error updating stock:", updateError);
          throw updateError;
        }
      } else {
        // Insert new stock record
        console.log("Creating new stock record for product in warehouse");
        
        const { error: insertError } = await supabase
          .from('warehouse_stock')
          .insert({
            warehouse_id: data.warehouseId,
            product_id: data.productId,
            quantity: data.quantity,
            unit_price: data.unitPrice,
            total_value: data.quantity * data.unitPrice
          });

        if (insertError) {
          console.error("Error inserting new stock:", insertError);
          throw insertError;
        }
      }

      toast.success("Entrée de stock enregistrée avec succès");
      queryClient.invalidateQueries({ queryKey: ['stock-movements', 'in'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse-stock'] });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      toast.error("Erreur lors de l'enregistrement de l'entrée");
      return false;
    }
  };

  return {
    createStockEntry
  };
}
