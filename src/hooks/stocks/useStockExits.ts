
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StockEntryForm } from "./useStockMovementTypes";

export function useStockExits() {
  const queryClient = useQueryClient();
  
  const createStockExit = async (data: StockEntryForm) => {
    try {
      console.log("Submitting stock exit:", data);
      
      // Check if there's enough stock
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

      if (!existingStock) {
        toast.error("Aucun stock disponible pour ce produit dans cet entrepôt");
        return false;
      }

      if (existingStock.quantity < data.quantity) {
        toast.error("Stock insuffisant pour effectuer cette sortie");
        return false;
      }

      // Calculate total value
      const totalValue = data.quantity * data.unitPrice;
      
      // Create the stock movement entry
      const { error: movementError } = await supabase.from('warehouse_stock_movements').insert({
        warehouse_id: data.warehouseId,
        product_id: data.productId,
        quantity: data.quantity,
        unit_price: data.unitPrice,
        total_value: totalValue,
        reason: data.reason,
        type: 'out'
      });

      if (movementError) {
        console.error("Error creating movement:", movementError);
        throw movementError;
      }

      // Update stock quantity
      const newQuantity = existingStock.quantity - data.quantity;
      const { error: updateError } = await supabase
        .from('warehouse_stock')
        .update({
          quantity: newQuantity,
          total_value: newQuantity * existingStock.unit_price,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingStock.id);

      if (updateError) {
        console.error("Error updating stock:", updateError);
        throw updateError;
      }

      toast.success("Sortie de stock enregistrée avec succès");
      queryClient.invalidateQueries({ queryKey: ['stock-movements', 'out'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse-stock'] });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      toast.error("Erreur lors de l'enregistrement de la sortie");
      return false;
    }
  };

  return {
    createStockExit
  };
}
