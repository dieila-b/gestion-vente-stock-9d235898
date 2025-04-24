
import { supabase } from '@/integrations/supabase/client';

export const updateOrderTotal = async (orderId: string, updateData: any) => {
  try {
    console.log("Calculating order total for ID:", orderId);
    
    // Get current items
    const { data: items, error: itemsError } = await supabase
      .from('purchase_order_items')
      .select('quantity, unit_price, total_price')
      .eq('purchase_order_id', orderId);
    
    if (itemsError) {
      console.error("Error fetching order items for total calculation:", itemsError);
      throw itemsError;
    }
    
    console.log("Found items for calculation:", items?.length || 0);
    
    // Calculate subtotal
    const subtotal = items?.reduce((sum, item) => {
      const itemTotal = (item.quantity || 0) * (item.unit_price || 0);
      return sum + itemTotal;
    }, 0) || 0;
    
    // Calculate tax amount and total
    const taxRate = updateData.tax_rate !== undefined ? updateData.tax_rate : 0;
    const taxAmount = taxRate ? subtotal * (taxRate / 100) : 0;
    const totalTTC = subtotal + taxAmount;
    
    // Get additional costs with defaults if not provided
    const shippingCost = updateData.shipping_cost !== undefined ? updateData.shipping_cost : 0;
    const transitCost = updateData.transit_cost !== undefined ? updateData.transit_cost : 0;
    const logisticsCost = updateData.logistics_cost !== undefined ? updateData.logistics_cost : 0;
    const discount = updateData.discount !== undefined ? updateData.discount : 0;
    
    // Calculate final total amount including additional costs
    const totalAmount = totalTTC + 
      shippingCost + 
      transitCost + 
      logisticsCost - 
      discount;
    
    console.log("Calculated totals:", {
      subtotal,
      taxAmount,
      totalTTC,
      totalAmount,
      shippingCost,
      transitCost,
      logisticsCost,
      discount
    });
    
    // Update the purchase order with new totals
    const { error: updateError } = await supabase
      .from('purchase_orders')
      .update({
        subtotal,
        tax_amount: taxAmount,
        total_ttc: totalTTC,
        total_amount: totalAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);
      
    if (updateError) {
      console.error("Error updating order totals:", updateError);
      throw updateError;
    }
    
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
