
import { Client } from "./client_unified";

export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  discount?: number;
  category?: string;
  reference?: string;
  image_url?: string;
  subtotal: number;
}

export interface CartState {
  items: CartItem[];
  client: Client | null;
  subtotal: number;
  total: number;
  discount: number;
}
