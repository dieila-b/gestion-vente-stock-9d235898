
import { supabase } from '@/integrations/supabase/client';

export const updateOrderTotal = async (orderId: string, updateData: any) => {
  try {
    // Get current items
    const { data: items } = await supabase
      .from('purchase_order_items')
      .select('total_price')
      .eq('purchase_order_id', orderId);
    
    // Calculate subtotal
    const subtotal = items?.reduce((sum, item) => sum + (item.total_price || 0), 0) || 0;
    
    // Calculate tax amount and total
    const taxAmount = updateData.tax_rate ? subtotal * (updateData.tax_rate / 100) : 0;
    const totalTTC = subtotal + taxAmount;
    
    // Calculate final total amount including additional costs
    const totalAmount = totalTTC + 
      (updateData.shipping_cost || 0) + 
      (updateData.transit_cost || 0) + 
      (updateData.logistics_cost || 0) - 
      (updateData.discount || 0);
    
    return {
      subtotal,
      taxAmount,
      totalTTC,
      totalAmount
    };
  } catch (error) {
    console.error('Error updating order total:', error);
    return {
      subtotal: 0,
      taxAmount: 0,
      totalTTC: 0,
      totalAmount: 0
    };
  }
};
