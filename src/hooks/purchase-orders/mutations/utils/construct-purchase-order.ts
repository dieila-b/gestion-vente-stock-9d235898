
import { PurchaseOrder } from "@/types/purchase-order";

export function constructPurchaseOrder(data: any): PurchaseOrder {
  console.log("Constructing purchase order from data:", data?.id);
  
  // Ensure supplier is properly structured
  const supplier = data?.supplier && typeof data.supplier === 'object' 
    ? data.supplier 
    : {
        id: data?.supplier_id || '',
        name: "Fournisseur inconnu",
        phone: "",
        email: ""
      };
  
  // Validate status with strict type checking
  let status: PurchaseOrder['status'] = "pending";
  if (data?.status) {
    if (data.status === "approved") status = "approved";
    else if (data.status === "draft") status = "draft";
    else if (data.status === "pending") status = "pending";
    else if (data.status === "delivered") status = "delivered";
  }
  
  // Validate payment_status with strict type checking
  let paymentStatus: PurchaseOrder['payment_status'] = "pending";
  if (data?.payment_status) {
    if (data.payment_status === "pending") paymentStatus = "pending";
    else if (data.payment_status === "partial") paymentStatus = "partial";
    else if (data.payment_status === "paid") paymentStatus = "paid";
  }
  
  // Pour delivery_note_created, on s'assure que c'est bien un boolean
  const deliveryNoteCreated: boolean = data?.delivery_note_created === true;
  
  // Create a properly typed PurchaseOrder object
  const purchaseOrder: PurchaseOrder = {
    id: data?.id || '',
    order_number: data?.order_number || '',
    created_at: data?.created_at || new Date().toISOString(),
    updated_at: data?.updated_at || data?.created_at || new Date().toISOString(),
    status: status,
    supplier_id: data?.supplier_id || '',
    discount: data?.discount || 0,
    expected_delivery_date: data?.expected_delivery_date || '',
    notes: data?.notes || '',
    logistics_cost: data?.logistics_cost || 0,
    transit_cost: data?.transit_cost || 0,
    tax_rate: data?.tax_rate || 0,
    shipping_cost: data?.shipping_cost || 0,
    subtotal: data?.subtotal || 0,
    tax_amount: data?.tax_amount || 0,
    total_ttc: data?.total_ttc || 0,
    total_amount: data?.total_amount || 0,
    paid_amount: data?.paid_amount || 0,
    payment_status: paymentStatus,
    warehouse_id: data?.warehouse_id || undefined,
    supplier: supplier,
    items: data?.items || [],
    delivery_note_created: deliveryNoteCreated
  };
  
  console.log("Constructed purchase order:", {
    id: purchaseOrder.id,
    status: purchaseOrder.status,
    delivery_note_created: purchaseOrder.delivery_note_created
  });
  
  return purchaseOrder;
}
