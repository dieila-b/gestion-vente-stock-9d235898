
import { supabase } from '@/integrations/supabase/client';

export const updateOrderTotal = async (orderId: string, updateData: any) => {
  try {
    console.log("Calculating order total for ID:", orderId, "with data:", updateData);
    
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
    const { data: updateResult, error: updateError } = await supabase
      .from('purchase_orders')
      .update({
        subtotal,
        tax_amount: taxAmount,
        total_ttc: totalTTC,
        total_amount: totalAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select();
      
    if (updateError) {
      console.error("Error updating order totals:", updateError);
      throw updateError;
    }
    
    console.log("Successfully updated order totals:", updateResult);
    
    // Return the calculated totals AND update data to ensure both are included
    return {
      subtotal,
      taxAmount,
      totalTTC,
      totalAmount,
      shippingCost,
      transitCost,
      logisticsCost,
      discount,
      ...updateData
    };
  } catch (error) {
    console.error('Error updating order total:', error);
    throw error; // Propagate the error instead of returning zeros
  }
}
