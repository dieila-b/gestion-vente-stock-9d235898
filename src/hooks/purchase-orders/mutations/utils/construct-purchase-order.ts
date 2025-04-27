
import { PurchaseOrder } from "@/types/purchase-order";

// Utility function to construct a PurchaseOrder object with proper typing
export function constructPurchaseOrder(data: Partial<PurchaseOrder>): PurchaseOrder {
  // Ensure delivery_note_created is explicitly a boolean
  const delivery_note_created = data.delivery_note_created === true;
  
  // Ensure status is a valid enum value
  const status = data.status || 'pending';
  const validStatuses = ['draft', 'pending', 'delivered', 'approved'];
  const safeStatus = validStatuses.includes(status) ? 
    status as 'draft' | 'pending' | 'delivered' | 'approved' : 
    'pending';
  
  // Return a properly typed PurchaseOrder object
  return {
    id: data.id || '',
    order_number: data.order_number || '',
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at,
    status: safeStatus,
    supplier_id: data.supplier_id || '',
    discount: data.discount || 0,
    expected_delivery_date: data.expected_delivery_date || '',
    notes: data.notes || '',
    logistics_cost: data.logistics_cost || 0,
    transit_cost: data.transit_cost || 0,
    tax_rate: data.tax_rate || 0,
    shipping_cost: data.shipping_cost || 0,
    subtotal: data.subtotal || 0,
    tax_amount: data.tax_amount || 0,
    total_ttc: data.total_ttc || 0,
    total_amount: data.total_amount || 0,
    paid_amount: data.paid_amount || 0,
    payment_status: data.payment_status || 'pending',
    warehouse_id: data.warehouse_id,
    supplier: data.supplier || { id: '', name: '' },
    warehouse: data.warehouse,
    items: data.items || [],
    deleted: data.deleted || false,
    delivery_note_created: delivery_note_created
  };
}
