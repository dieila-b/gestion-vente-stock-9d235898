
export interface InvoiceItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  original_quantity: number;
}

export interface CustomerReturn {
  id: string;
  return_number: string;
  client_id: string;
  invoice_id: string;
  return_date: string;
  total_amount: number;
  status: string;
  reason: string;
  notes: string;
  created_at: string;
  updated_at: string;
  client: {
    company_name: string;
  };
  returned_items?: any[];
  invoice?: any;
}

export interface ReturnItem {
  product_id: string;
  quantity: number;
  original_quantity?: number;
  price?: number;
}
