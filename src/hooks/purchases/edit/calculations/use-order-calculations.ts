
import { supabase } from '@/integrations/supabase/client';

export const updateOrderTotal = async (orderId: string, updateData: any) => {
  try {
    console.log('Calculating order totals for order:', orderId);
    
    // Get current items
    const { data: items, error: itemsError } = await supabase
      .from('purchase_order_items')
      .select('total_price')
      .eq('purchase_order_id', orderId);
    
    if (itemsError) {
      console.error('Error fetching items for total calculation:', itemsError);
      throw itemsError;
    }
    
    // Calculate subtotal
    const subtotal = items?.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0) || 0;
    console.log('Calculated subtotal:', subtotal);
    
    // Calculate tax amount and total
    const taxRate = updateData.tax_rate ? Number(updateData.tax_rate) : 0;
    const taxAmount = taxRate > 0 ? subtotal * (taxRate / 100) : 0;
    const totalTTC = subtotal + taxAmount;
    
    // Get additional costs
    const shippingCost = Number(updateData.shipping_cost) || 0;
    const transitCost = Number(updateData.transit_cost) || 0;
    const logisticsCost = Number(updateData.logistics_cost) || 0;
    const discount = Number(updateData.discount) || 0;
    
    // Calculate final total amount including additional costs
    const totalAmount = totalTTC + shippingCost + transitCost + logisticsCost - discount;
    
    console.log('Final calculated totals:', {
      subtotal,
      taxRate,
      taxAmount,
      totalTTC,
      shippingCost,
      transitCost,
      logisticsCost,
      discount,
      totalAmount
    });
    
    // Update the purchase order with the calculated values
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
      console.error('Error updating order totals in DB:', updateError);
      throw updateError;
    }
    
    return {
      subtotal,
      taxAmount,
      totalTTC,
      totalAmount,
      shippingCost,
      transitCost,
      logisticsCost,
      discount
    };
  } catch (error) {
    console.error('Error updating order total:', error);
    throw error;
  }
};
