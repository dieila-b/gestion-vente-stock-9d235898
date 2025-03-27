export interface PurchaseOrderItem {
  id?: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  selling_price: number;
  total_price: number;
}

export interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier: { name: string };
  supplier_id: string;
  created_at: string;
  status: "draft" | "pending" | "delivered" | "approved";
  payment_status: "pending" | "partial" | "paid";
  total_amount: number;
  items: any[]; // Consider creating a proper type for items
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
  paid_amount: number; // Added this field to fix build errors
  deleted: boolean;
}
