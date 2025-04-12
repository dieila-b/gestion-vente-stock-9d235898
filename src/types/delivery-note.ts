
export interface DeliveryNote {
  id: string;
  delivery_number: string;
  created_at: string;
  updated_at: string;
  notes: string;
  status: string;
  supplier_id?: string;
  purchase_order_id?: string;
  
  // Adding error property which is shown in error messages
  supplier?: {
    name: string;
    phone?: string;
    email?: string;
    error?: boolean;
  };
  purchase_order?: {
    order_number: string;
    total_amount: number;
    error?: boolean;
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
