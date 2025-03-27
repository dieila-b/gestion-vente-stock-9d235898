
import { CatalogProduct } from "./catalog";

export interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email?: string;
  amount: number;
  description?: string;
  vat_rate: number;
  signature?: string;
  discount: number;
  payment_status: 'pending' | 'partial' | 'paid';
  paid_amount: number;
  remaining_amount: number;
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id: string;
  quantity: number;
  price: number;
  discount: number;
  created_at?: string;
}

export interface InvoiceProduct extends CatalogProduct {
  quantity: number;
  discount: number;
}
