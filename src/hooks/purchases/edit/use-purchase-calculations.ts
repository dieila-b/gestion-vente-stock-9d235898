
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Updates the order total based on its items and additional costs
 */
export async function updateOrderTotal(orderId: string, formData: any, refetch?: () => Promise<any>) {
  try {
    console.log("Updating order total for order:", orderId);
    
    // First, get the current items to calculate subtotal
    const { data: itemsData, error: itemsError } = await supabase
      .from('purchase_order_items')
      .select('total_price')
      .eq('purchase_order_id', orderId);
    
    if (itemsError) {
      console.error("Error fetching items for total calculation:", itemsError);
      throw itemsError;
    }
    
    // Calculate subtotal from all items
    const subtotal = itemsData?.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0) || 0;
    console.log("Calculated subtotal:", subtotal);
    
    // Get additional costs from form data
    const discount = Number(formData?.discount || 0);
    const shippingCost = Number(formData?.shipping_cost || 0);
    const logisticsCost = Number(formData?.logistics_cost || 0);
    const transitCost = Number(formData?.transit_cost || 0);
    const taxRate = Number(formData?.tax_rate || 0);
    
    // Calculate tax amount
    const taxAmount = subtotal * (taxRate / 100);
    
    // Calculate total with tax
    const totalTTC = subtotal + taxAmount;
    
    // Calculate total amount with all costs
    const totalAmount = totalTTC + shippingCost + logisticsCost + transitCost - discount;
    
    console.log("Calculated amounts:", {
      subtotal,
      taxAmount,
      totalTTC,
      totalAmount,
      additionalCosts: {
        discount,
        shippingCost,
        logisticsCost,
        transitCost,
        taxRate
      }
    });
    
    // Update the order with new totals
    const { error: updateError } = await supabase
      .from('purchase_orders')
      .update({
        subtotal: subtotal,
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
    
    console.log("Order totals updated successfully");
    
    // Refetch if function is provided
    if (refetch) {
      await refetch();
    }
    
    return {
      success: true,
      subtotal,
      taxAmount,
      totalTTC,
      totalAmount
    };
  } catch (error) {
    console.error("Error in updateOrderTotal:", error);
    toast.error("Erreur lors de la mise à jour des totaux de commande");
    return { success: false };
  }
}
