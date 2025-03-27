
import { supabase } from "@/integrations/supabase/client";

export async function updateProductStock(cart: any[]): Promise<void> {
  try {
    for (const item of cart) {
      if (item.stock && item.stock >= item.quantity) {
        const { error: stockError } = await supabase
          .from('catalog')
          .update({ stock: item.stock - item.quantity })
          .eq('id', item.id);
          
        if (stockError) {
          console.error('Error updating stock:', stockError);
        }
      }
    }
  } catch (error) {
    console.error('Error updating product stock:', error);
    throw error;
  }
}
