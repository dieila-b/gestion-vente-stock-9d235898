
export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  discount?: number;
  subtotal: number;
  barcode?: string;
  category?: string;
}

export interface CartState {
  items: CartItem[];
  client: any | null;
  discount: number;
  subtotal: number;
  total: number;
  notes: string;
  [key: string]: any;
}
