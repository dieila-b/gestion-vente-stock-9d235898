
export interface SupplierOrderProduct {
  id?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  category?: string;
  reference?: string;
  status?: "pending" | "validated" | "rejected";
  qualityCheck?: boolean;
  priceRequested?: boolean;
}

export interface SupplierOrderWithItems {
  id: string;
  order_number: string;
  supplier_id: string;
  expected_delivery_date?: string;
  status: "pending" | "delivered" | "draft" | "approved";
  payment_status: "pending" | "partial" | "paid";
  notes?: string;
  total_amount: number;
  paid_amount: number;
  discount?: number;
  shipping_cost?: number;
  logistics_cost?: number;
  transit_cost?: number;
  tax_rate?: number;
  tax_amount?: number;
  subtotal?: number;
  created_at: string;
  updated_at?: string;
  supplier?: {
    name: string;
    phone?: string | null;
    email?: string | null;
  };
  items: SupplierOrderProduct[];
}
