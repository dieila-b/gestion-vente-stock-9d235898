
import { supabase } from "@/integrations/supabase/client";
import type { PurchaseOrder } from "@/types/purchaseOrder";

// Type guard function to validate order status
function isValidOrderStatus(status: string): status is PurchaseOrder['status'] {
  return ['pending', 'draft', 'delivered', 'approved'].includes(status);
}

// Type guard function to validate payment status
function isValidPaymentStatus(status: string): status is PurchaseOrder['payment_status'] {
  return ['pending', 'partial', 'paid'].includes(status);
}

export function useCreatePurchaseOrder() {
  return async (orderData: Partial<PurchaseOrder>) => {
    // Generate order number if not provided
    const orderNumber = orderData.order_number || `BC-${new Date().toISOString().slice(0, 10)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    // Créer une copie de orderData sans la propriété items
    const { items, ...orderDataWithoutItems } = orderData;

    const finalOrderData = {
      ...orderDataWithoutItems,
      order_number: orderNumber,
      status: isValidOrderStatus(orderData.status || 'draft') ? orderData.status : 'draft',
      payment_status: isValidPaymentStatus(orderData.payment_status || 'pending') ? orderData.payment_status : 'pending',
      paid_amount: orderData.paid_amount || 0,
      deleted: false
    };

    const { data, error } = await supabase
      .from('purchase_orders')
      .insert(finalOrderData)
      .select(`
        *,
        supplier:suppliers (
          name
        )
      `)
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from insert');

    // Create a base order object with default values
    const transformedOrder: PurchaseOrder = {
      id: data.id,
      order_number: data.order_number,
      supplier: data.supplier || { name: '' },
      supplier_id: data.supplier_id,
      created_at: data.created_at,
      status: isValidOrderStatus(data.status) ? data.status : 'draft',
      payment_status: isValidPaymentStatus(data.payment_status || 'pending') ? data.payment_status : 'pending',
      paid_amount: data.paid_amount || 0,
      total_amount: data.total_amount || 0,
      items: [], // Initialize with empty array
      logistics_cost: data.logistics_cost || 0,
      transit_cost: data.transit_cost || 0,
      tax_rate: data.tax_rate || 0,
      subtotal: data.subtotal || 0,
      tax_amount: data.tax_amount || 0,
      total_ttc: data.total_ttc || 0,
      shipping_cost: data.shipping_cost || 0,
      discount: data.discount || 0,
      notes: data.notes || '',
      expected_delivery_date: data.expected_delivery_date || '',
      warehouse_id: data.warehouse_id || '',
      deleted: data.deleted || false
    };
    
    // Add optional properties if they exist in the data
    if ('customs_duty' in data) {
      transformedOrder.customs_duty = data.customs_duty;
    }
    
    if ('delivery_note_id' in data) {
      transformedOrder.delivery_note_id = data.delivery_note_id;
    }
    
    return transformedOrder;
  };
}
