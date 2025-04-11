
export interface DeliveryNote {
  id: string;
  delivery_number: string;
  created_at: string;
  status: string;
  supplier: {
    id?: string;
    name?: string;
    phone?: string;
    email?: string;
  };
  purchase_order: {
    id?: string;
    order_number?: string;
    total_amount?: number;
  };
  items: Array<{
    id: string;
    product_id: string;
    expected_quantity: number;
    received_quantity?: number;
    unit_price: number;
    status?: string;
    product?: {
      id: string;
      name: string;
      reference?: string;
    };
  }>;
}
