
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "@/types/pos";

export const updateStockLevels = async (
  cart: CartItem[], 
  stockItems: any[], 
  selectedPDV: string
) => {
  for (const item of cart) {
    const stockItem = stockItems.find(stock => stock.product_id === item.id && 
      (selectedPDV === "_all" || stock.pos_location_id === selectedPDV));
    
    if (stockItem) {
      const newQuantity = Math.max(0, stockItem.quantity - item.quantity);
      
      const { error: stockError } = await supabase
        .from('warehouse_stock')
        .update({
          quantity: newQuantity,
          total_value: newQuantity * stockItem.unit_price,
          updated_at: new Date().toISOString()
        })
        .eq('id', stockItem.id);
      
      if (stockError) {
        console.error('Error updating stock:', stockError);
      }
    } else {
      console.warn(`Stock not found for product ${item.id} at POS location ${selectedPDV}`);
    }
  }
};
