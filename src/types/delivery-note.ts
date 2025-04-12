
export interface DeliveryNote {
  id: string;
  delivery_number: string;
  created_at: string;
  updated_at: string;
  notes: string;
  status: string;  // Added this field
  supplier_id?: string;
  purchase_order_id?: string;
  
  // Adding these properties to match the implementation
  supplier?: {
    name: string;
    phone?: string;
    email?: string;
  };
  purchase_order?: {
    order_number: string;
    total_amount: number;
  };
  items: DeliveryNoteItem[];
}

export interface DeliveryNoteItem {
  id: string;
  delivery_note_id: string;
  product_id: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_price: number;
  product?: {
    name: string;
    reference: string;
    category?: string;
  };
}
