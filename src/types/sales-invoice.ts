
export interface SalesInvoice {
  id: string;
  invoice_number: string;
  order_id: string;
  client_id: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  payment_status: 'paid' | 'partial' | 'pending';
  delivery_status: 'delivered' | 'partial' | 'awaiting' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface SalesInvoiceItem {
  id: string;
  sales_invoice_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total_price: number;
  delivered_quantity: number;
}
