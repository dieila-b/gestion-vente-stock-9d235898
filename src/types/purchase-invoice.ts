
import { Supplier } from "./supplier";

export interface PurchaseInvoice {
  id: string;
  invoice_number: string;
  supplier_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  total_amount: number;
  tax_amount: number;
  payment_status: string;
  due_date?: string;
  paid_amount: number;
  remaining_amount: number;
  discount: number;
  notes?: string;
  shipping_cost: number;
  supplier: Supplier;
  purchase_order?: {
    id: string;
    order_number: string;
  };
  delivery_note?: {
    id: string;
    delivery_number: string;
  };
}

export interface PurchaseInvoiceItem {
  id: string;
  invoice_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product: {
    id: string;
    name: string;
    reference?: string;
    category?: string;
  };
}
