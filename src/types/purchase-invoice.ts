
export interface PurchaseInvoice {
  id: string;
  invoice_number: string;
  supplier_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  tax_amount: number;
  payment_status: string;
  due_date: string;
  paid_amount: number;
  remaining_amount: number;
  discount: number;
  notes: string;
  shipping_cost: number;
  supplier?: {
    id?: string;
    name: string;
    phone?: string;
    email?: string;
  };
  purchase_order?: {
    id?: string;
    order_number?: string;
    created_at?: string;
  };
  delivery_note?: {
    id?: string;
    delivery_number?: string;
  };
}
