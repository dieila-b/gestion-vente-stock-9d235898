
export interface PurchaseInvoice {
  id: string;
  invoice_number: string;
  supplier_id: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  
  // Additional properties needed based on error messages
  tax_amount: number;
  payment_status: string;
  due_date: string;
  paid_amount: number;
  discount: number;
  notes: string;
  shipping_cost: number;
  remaining_amount: number;
  
  // Nested objects for relations
  supplier?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  purchase_order?: {
    id: string;
    order_number: string;
  };
  delivery_note?: {
    id: string;
    delivery_number: string;
  };
}
