
import { PurchaseOrder } from "@/types/purchase-order";

export function constructPurchaseOrder(data: any): PurchaseOrder {
  // Ensure supplier is properly structured
  const supplier = data.supplier && typeof data.supplier === 'object' 
    ? data.supplier 
    : {
        id: data.supplier_id || '',
        name: "Fournisseur inconnu",
        phone: "",
        email: ""
      };
  
  // Use type casting for status to ensure it matches the enum type
  const status = data.status || 'approved';
  const validStatus = ['approved', 'draft', 'pending', 'delivered'].includes(status) 
    ? status as PurchaseOrder['status']
    : 'pending' as PurchaseOrder['status'];
    
  // Use type casting for payment_status
  const paymentStatus = data.payment_status || 'pending';
  const validPaymentStatus = ['pending', 'partial', 'paid'].includes(paymentStatus)
    ? paymentStatus as PurchaseOrder['payment_status']
    : 'pending' as PurchaseOrder['payment_status'];
  
  // Handle delivery_note_created explicitly as a boolean
  const deliveryNoteCreated = data.delivery_note_created !== undefined 
    ? Boolean(data.delivery_note_created) 
    : false;
  
  // Create a properly typed PurchaseOrder object
  const purchaseOrder: PurchaseOrder = {
    id: data.id || '',
    order_number: data.order_number || '',
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || data.created_at || new Date().toISOString(),
    status: validStatus,
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
    payment_status: validPaymentStatus,
    warehouse_id: data.warehouse_id || undefined,
    supplier: supplier,
    items: data.items || [],
    delivery_note_created: deliveryNoteCreated
  };
  
  console.log("Constructed purchase order:", {
    id: purchaseOrder.id,
    status: purchaseOrder.status,
    delivery_note_created: purchaseOrder.delivery_note_created
  });
  
  return purchaseOrder;
}
