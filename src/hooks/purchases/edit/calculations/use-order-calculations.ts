
import { supabase } from '@/integrations/supabase/client';
import { PurchaseOrder, PurchaseOrderItem } from '@/types/purchase-order';
import { toast } from 'sonner';

/**
 * Calculate and update the total amounts for a purchase order
 */
export async function updateOrderTotal(
  orderId: string,
  formData: Partial<PurchaseOrder>
): Promise<{
  subtotal: number;
  taxAmount: number;
  totalTTC: number;
  totalAmount: number;
  shippingCost?: number;
  transitCost?: number;
  logisticsCost?: number;
  discount?: number;
} | null> {
  try {
    console.log("Calculating order total for ID:", orderId);
    
    // First fetch the current items for this order
    const { data: items, error: itemsError } = await supabase
      .from('purchase_order_items')
      .select('quantity, unit_price')
      .eq('purchase_order_id', orderId);
      
    if (itemsError) {
      console.error("Error fetching order items for calculation:", itemsError);
      throw itemsError;
    }

    console.log("Found items for calculation:", items?.length || 0);
    
    // Calculate the subtotal based on items
    const subtotal = items?.reduce((sum, item) => {
      return sum + (item.quantity * item.unit_price);
    }, 0) || 0;
    
    // Get values from formData with fallbacks
    const taxRate = formData.tax_rate || 0;
    const shippingCost = formData.shipping_cost || 0;
    const transitCost = formData.transit_cost || 0;
    const logisticsCost = formData.logistics_cost || 0;
    const discount = formData.discount || 0;
    
    // Calculate remaining totals
    const taxAmount = (subtotal * taxRate) / 100;
    const totalTTC = subtotal + taxAmount;
    const totalAmount = totalTTC + shippingCost + transitCost + logisticsCost - discount;
    
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

    // Return the values without updating the database (that will be done in saveChanges)
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
    console.error("Error calculating order total:", error);
    toast.error("Erreur lors du calcul du total de la commande");
    return null;
  }
}
