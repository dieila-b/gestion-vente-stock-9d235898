
export interface DeliveryNote {
  id: string;
  delivery_number: string;
  created_at: string;
  updated_at: string;
  notes: string;
  status: string;
  supplier: {
    name: string;
    phone?: string;
    email?: string;
  };
  purchase_order: {
    order_number?: string;
    total_amount?: number;
  };
  items: Array<{
    id: string;
    product_id: string;
    quantity_ordered: number;
    quantity_received: number;
    unit_price: number;
    product: {
      name: string;
      reference?: string;
      category?: string;
    };
  }>;
}
