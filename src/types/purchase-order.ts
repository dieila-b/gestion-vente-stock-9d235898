
import { Supplier } from "./supplier";

export interface PurchaseOrder {
  id: string;
  order_number: string;
  created_at: string;
  updated_at?: string;
  status: string;
  supplier_id: string;
  discount: number;
  expected_delivery_date: string;
  notes: string;
  logistics_cost: number;
  transit_cost: number;
  tax_rate: number;
  shipping_cost: number;
  subtotal: number;
  tax_amount: number;
  total_ttc: number;
  total_amount: number;
  paid_amount: number;
  payment_status: string;
  warehouse_id?: string;
  supplier: Supplier;
  warehouse?: {
    id: string;
    name: string;
  };
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  selling_price: number;
  total_price: number;
  product?: {
    name: string;
    reference?: string;
  };
}
