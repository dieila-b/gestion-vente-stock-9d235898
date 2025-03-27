
export interface CustomerReturn {
  id: string;
  return_number: string;
  client_id: string;
  invoice_id: string;
  return_date: string;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  reason: string | null;
  notes: string | null;
  client?: {
    company_name: string;
  };
  invoice?: {
    invoice_number: string;
    items?: InvoiceItem[];
  } | null;
  returned_items?: ReturnedItem[] | null;
}

export interface ReturnedItem {
  product_name: string;
  quantity: number;
}

export interface InvoiceItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

export interface NewReturnForm {
  client_id: string;
  invoice_id: string;
  reason: string;
  notes: string;
  items: {
    product_id: string;
    quantity: number;
  }[];
}
