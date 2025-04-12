
export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  discount: number;
  category: string;
  subtotal: number;
  stock?: number;  // Added stock property
  image_url?: string;
  reference?: string;
}

export interface CartState {
  items: CartItem[];
  client: {
    id: string;
    company_name: string;
    [key: string]: any;
  } | null;
  notes: string;
  subtotal: number;  // Changed from optional to required
  discount: number;  // Changed from optional to required
  total: number;     // Changed from optional to required
}
