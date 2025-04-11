
export interface CustomerReturn {
  id: string;
  return_number: string;
  client_id: string;
  invoice_id?: string;
  return_date: string;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  reason?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  client: { company_name: string };
  invoice?: { invoice_number: string };
  returned_items?: ReturnedItem[];
}

export interface ReturnedItem {
  product_name: string;
  quantity: number;
}

export interface ReturnItem {
  product_id: string;
  quantity: number;
  price: number;
}

export interface ReturnFormData {
  client_id: string;
  invoice_id?: string;
  reason: string;
  notes?: string;
  items: ReturnItem[];
}
