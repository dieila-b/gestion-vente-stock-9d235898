
export interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier: {
    name: string;
  };
  supplier_id: string;
  created_at: string;
  status: 'draft' | 'pending' | 'delivered' | 'approved';
  payment_status: 'pending' | 'partial' | 'paid';
  total_amount: number;
  paid_amount: number;
  items: Array<PurchaseOrderItem>;
  logistics_cost: number;
  transit_cost: number;
  tax_rate: number;
  subtotal: number;
  tax_amount: number;
  total_ttc: number;
  shipping_cost: number;
  customs_duty: number;
  discount: number;
  expected_delivery_date?: string;
  notes?: string;
  warehouse_id?: string;
  delivery_note_id?: string;
  deleted: boolean;
}

export interface PurchaseOrderItem {
  id: string;
  product_id: string;
  product_code?: string;
  designation?: string;
  quantity: number;
  unit_price: number;
  selling_price: number;
  total_price: number;
}
