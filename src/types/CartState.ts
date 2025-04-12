
export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  discount: number;
  category: string;
  subtotal: number;
}

export interface CartState {
  items: CartItem[];
  client: {
    id: string;
    company_name: string;
    [key: string]: any;
  } | null;
  notes: string;
}
