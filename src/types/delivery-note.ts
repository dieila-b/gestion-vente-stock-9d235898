
export interface DeliveryNote {
  id: string;
  delivery_number: string;
  created_at: string;
  updated_at: string;
  notes: string;
  status: string;
  supplier_id?: string;
  purchase_order_id?: string;
  warehouse_id?: string; // Ajout du champ manquant
  deleted?: boolean; // Ajout du champ manquant
  
  supplier?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  purchase_order?: {
    id: string;
    order_number: string;
    total_amount: number;
  };
  items: DeliveryNoteItem[];
}

export interface DeliveryNoteItem {
  id: string;
  delivery_note_id?: string;
  product_id: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_price: number;
  product?: {
    id: string;
    name: string;
    reference: string;
    category?: string;
  };
}
