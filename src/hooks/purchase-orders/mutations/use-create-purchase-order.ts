
import { supabase } from "@/integrations/supabase/client";
import type { PurchaseOrder } from "@/types/purchaseOrder";
import { safeSupplier } from "@/utils/supabase-safe-query";

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

    // Create a copy of orderData without the items property
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
          name,
          phone,
          email
        )
      `)
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from insert');

    // Safely handle supplier data using safeSupplier
    const supplierData = safeSupplier(data.supplier);

    // Map the returned data to the PurchaseOrder type
    const transformedOrder: PurchaseOrder = {
      id: data.id,
      order_number: data.order_number,
      supplier: {
        name: supplierData.name || '',
        phone: supplierData.phone || null,
        email: supplierData.email || null
      },
      supplier_id: data.supplier_id,
      created_at: data.created_at,
      status: isValidOrderStatus(data.status) ? data.status : 'draft',
      // Define payment_status with a safer approach
      payment_status: 'pending', // Default value
      paid_amount: 0, // Default value
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
      deleted: Boolean(data.deleted) || false
    };
    
    // Override with actual values if they exist
    if ('payment_status' in data && typeof data.payment_status === 'string') {
      transformedOrder.payment_status = isValidPaymentStatus(data.payment_status) 
        ? data.payment_status as PurchaseOrder['payment_status']
        : 'pending';
    }
    
    if ('paid_amount' in data && typeof data.paid_amount === 'number') {
      transformedOrder.paid_amount = data.paid_amount;
    }
    
    // Add optional properties if they exist in the data
    if ('customs_duty' in data) {
      transformedOrder.customs_duty = Number(data.customs_duty) || 0;
    }
    
    if ('delivery_note_id' in data) {
      transformedOrder.delivery_note_id = String(data.delivery_note_id) || '';
    }
    
    return transformedOrder;
  };
}
