
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StockEntryForm } from "./useStockMovementTypes";

export function useStockExits() {
  const queryClient = useQueryClient();

  const createStockExit = async (data: StockEntryForm) => {
    try {
      console.log("Submitting stock exit:", data);
      
      // Calculate total value
      const totalValue = data.quantity * data.unitPrice;
      
      // Vérifier le stock disponible avant de permettre la sortie
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

      if (!existingStock || existingStock.quantity < data.quantity) {
        const message = "Stock insuffisant pour effectuer cette sortie";
        console.error(message);
        toast.error(message);
        return false;
      }

      // Créer l'enregistrement de mouvement de stock
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
        console.error("Error creating movement:", movementError);
        throw movementError;
      }
      
      console.log("Movement created successfully:", movementData);

      // Mettre à jour le stock d'entrepôt
      const newQuantity = existingStock.quantity - data.quantity;
      const newTotalValue = newQuantity * existingStock.unit_price;
      
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
