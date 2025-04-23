
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PurchaseOrder } from '@/types/purchase-order';

interface CalculationResult {
  success: boolean;
  subtotal: number;
  taxAmount: number;
  totalTTC: number;
  totalAmount: number;
}

/**
 * Updates the totals for a purchase order
 */
export async function updateOrderTotal(
  orderId: string,
  formData: Partial<PurchaseOrder>
): Promise<CalculationResult> {
  try {
    console.log("Updating order total for order:", orderId);
    
    // First fetch items to calculate subtotal
    const { data: items, error: itemsError } = await supabase
      .from('purchase_order_items')
      .select('quantity, unit_price, total_price')
      .eq('purchase_order_id', orderId);
      
    if (itemsError) {
      console.error("Error fetching items for calculation:", itemsError);
      throw itemsError;
    }
    
    // Calculate subtotal from items
    let subtotal = 0;
    if (items && items.length > 0) {
      subtotal = items.reduce((total, item) => total + (item.total_price || (item.quantity * item.unit_price)), 0);
    }
    
    console.log("Calculated subtotal:", subtotal);
    
    // Extract additional costs from form data
    const discount = formData.discount || 0;
    const shippingCost = formData.shipping_cost || 0;
    const logisticsCost = formData.logistics_cost || 0;
    const transitCost = formData.transit_cost || 0; 
    const taxRate = formData.tax_rate || 0;
    
    // Apply additional costs
    const discountAmount = subtotal * (discount / 100);
    const subtotalAfterDiscount = subtotal - discountAmount;
    
    // Calculate tax amount
    const taxAmount = subtotalAfterDiscount * (taxRate / 100);
    
    // Calculate total including tax
    const totalTTC = subtotalAfterDiscount + taxAmount;
    
    // Calculate final total with all costs
    const totalAmount = totalTTC + shippingCost + logisticsCost + transitCost;
    
    const calculationResults = {
      subtotal,
      discountAmount,
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
    };
    
    console.log("Calculated amounts:", calculationResults);
    
    // Update the purchase order with the new totals
    const { data: updatedOrder, error: updateError } = await supabase
      .from('purchase_orders')
      .update({
        subtotal: subtotal,
        tax_amount: taxAmount,
        total_ttc: totalTTC,
        total_amount: totalAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select('id, subtotal, tax_amount, total_ttc, total_amount')
      .maybeSingle(); // Use maybeSingle instead of single to handle empty results
      
    if (updateError) {
      console.error("Error in updateOrderTotal:", updateError);
      throw updateError;
    }
    
    // Handle the case when no rows were updated (e.g., record doesn't exist)
    if (!updatedOrder) {
      console.warn(`No purchase order found with ID: ${orderId}`);
      // Return calculated values even if we couldn't update the database
      return {
        success: false,
        subtotal,
        taxAmount,
        totalTTC,
        totalAmount
      };
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
    return {
      success: false,
      subtotal: 0,
      taxAmount: 0,
      totalTTC: 0,
      totalAmount: 0
    };
  }
}
