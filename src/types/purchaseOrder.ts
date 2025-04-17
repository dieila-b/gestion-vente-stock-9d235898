
export interface PurchaseOrderItem {
  id: string; // Changed from optional to required
  product_id: string;
  product_code?: string;
  designation?: string;
  quantity: number;
  unit_price: number;
  selling_price: number;
  total_price: number;
}

export interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier: { 
    name: string;
    phone?: string | null;
    email?: string | null;
  };
  supplier_id: string;
  created_at: string;
  status: "draft" | "pending" | "delivered" | "approved";
  payment_status: "pending" | "partial" | "paid";
  total_amount: number;
  items: PurchaseOrderItem[];
  logistics_cost: number;
  transit_cost: number;
  tax_rate: number;
  subtotal: number;
  tax_amount: number;
  total_ttc: number;
  shipping_cost: number;
  discount: number;
  notes: string;
  expected_delivery_date: string;
  warehouse_id: string;
  paid_amount: number;
  customs_duty?: number;
  delivery_note_id?: string;
  deleted?: boolean; // Make it optional since it doesn't exist in the database
}
