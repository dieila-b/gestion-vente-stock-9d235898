
export interface SupplierOrderProduct {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
  reference: string;
  status: "pending" | "validated" | "rejected";
  qualityCheck: boolean;
}

export interface SupplierOrder {
  id: string;
  supplier_id: string;
  order_number: string;
  status: "draft" | "pending" | "approved" | "delivered" | "cancelled";
  payment_status: "pending" | "partial" | "paid";
  order_status: "pending" | "delivered";
  expected_delivery_date: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  notes?: string;
  delivery_address?: string;
  discount: number;
  shipping_cost: number;
  logistics_cost: number;
  transit_cost: number;
  tax_rate: number;
  subtotal: number;
  tax_amount: number;
  total_ttc: number;
  supplier?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  items?: SupplierOrderProduct[];
  created_at?: string;
  updated_at?: string;
}
