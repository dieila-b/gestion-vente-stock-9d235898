
import { Supplier } from "./supplier";

export interface PurchaseOrder {
  id: string;
  order_number: string;
  created_at: string;
  updated_at?: string;
  status: "draft" | "pending" | "delivered" | "approved";
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
  payment_status: "pending" | "partial" | "paid";
  warehouse_id?: string;
  supplier: Supplier;
  warehouse?: {
    id: string;
    name: string;
  };
  items?: PurchaseOrderItem[];
  deleted?: boolean; // Keep this optional as it doesn't exist in the database
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id?: string; // Made optional to accommodate different data structures
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

// Correctly re-export Supplier using export type
export type { Supplier } from "./supplier";
