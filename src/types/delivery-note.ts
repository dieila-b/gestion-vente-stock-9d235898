
export interface DeliveryNote {
  id: string;
  delivery_number: string;
  created_at: string;
  updated_at?: string;
  notes?: string;
  status: string; // Making this required
  supplier: {
    id?: string; // Add id field
    name: string;
    phone?: string;
    email?: string;
  };
  purchase_order: {
    id?: string; // Add id field
    order_number: string;
    total_amount: number;
  };
  items: DeliveryNoteItem[];
}

export interface DeliveryNoteItem {
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
}
