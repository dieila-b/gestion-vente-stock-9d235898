
export interface DeliveryNote {
  id: string;
  delivery_number: string;
  created_at: string;
  status: string;
  supplier: {
    name: string;
    phone?: string | null;
    email?: string | null;
  };
  purchase_order: {
    order_number: string;
    total_amount: number;
  } | null;
  items: Array<{
    id: string;
    product_id: string;
    quantity_ordered: number;
    quantity_received: number;
    unit_price?: number;
    product: {
      name: string;
      reference: string;
      category: string;
    };
  }>;
}
