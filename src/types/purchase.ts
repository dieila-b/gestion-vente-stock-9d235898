
export interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier_id: string;
  status: 'draft' | 'pending' | 'approved' | 'completed' | 'cancelled';
  total_amount: number;
  tax_amount: number;
  shipping_cost: number;
  expected_delivery_date: string | null;
  delivery_address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface DeliveryNote {
  id: string;
  delivery_number: string;
  purchase_order_id: string;
  supplier_id: string;
  status: 'pending' | 'received' | 'rejected';
  delivery_date: string | null;
  received_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeliveryNoteItem {
  id: string;
  delivery_note_id: string;
  product_id: string;
  quantity_ordered: number;
  quantity_received: number;
  quality_status: 'pending' | 'approved' | 'rejected';
  notes: string | null;
  created_at: string;
}

export interface PurchaseInvoice {
  id: string;
  invoice_number: string;
  supplier_id: string;
  purchase_order_id: string;
  delivery_note_id: string;
  total_amount: number;
  tax_amount: number;
  payment_status: 'pending' | 'partial' | 'paid';
  due_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupplierReturn {
  id: string;
  return_number: string;
  supplier_id: string;
  purchase_invoice_id: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  total_amount: number;
  reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupplierReturnItem {
  id: string;
  supplier_return_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  reason: string | null;
  created_at: string;
}
