
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Utility functions for purchase order calculations
 */

// Calculate the total items amount
export const calculateItemsTotal = (items: any[]) => {
  return items.reduce((total, item) => total + (Number(item.total_price) || 0), 0);
};

// Update the purchase order total based on item changes
export const updateOrderTotal = async (
  orderId: string,
  formData: any,
  refetch: () => Promise<any>
) => {
  if (!orderId) return false;
  
  try {
    const { data: items } = await supabase
      .from('purchase_order_items')
      .select('total_price')
      .eq('purchase_order_id', orderId);
    
    if (!items) return false;
    
    // Get the items total
    const itemsTotal = calculateItemsTotal(items);
    
    // Calculate the new total amount
    const discount = Number(formData.discount) || 0;
    const shippingCost = Number(formData.shipping_cost) || 0;
    const transitCost = Number(formData.transit_cost) || 0;
    const logisticsCost = Number(formData.logistics_cost) || 0;
    
    // Calculate subtotal (items total - discount)
    const subtotal = Math.max(0, itemsTotal - discount);
    
    // Calculate tax amount
    const taxRate = Number(formData.tax_rate) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    
    // Calculate total TTC (subtotal + tax)
    const totalTTC = subtotal + taxAmount;
    
    // Calculate total amount (total TTC + additional costs)
    const totalAmount = totalTTC + shippingCost + transitCost + logisticsCost;
    
    // Update the purchase order totals
    const { error } = await supabase
      .from('purchase_orders')
      .update({
        subtotal: subtotal,
        tax_amount: taxAmount,
        total_ttc: totalTTC,
        total_amount: totalAmount
      })
      .eq('id', orderId);
    
    if (error) throw error;
    
    // Refetch the purchase order to update the UI
    await refetch();
    
    return true;
  } catch (error: any) {
    toast.error(`Erreur lors de la mise à jour du total: ${error.message}`);
    return false;
  }
};
