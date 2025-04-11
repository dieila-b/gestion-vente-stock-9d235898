
// Adding/updating the CartItem interface to include unit_price, total, and image_url
export interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category?: string;
  reference?: string;
  discount?: number;
  discounted_price?: number;
  original_price?: number;
  stock?: number;
  unit_price?: number;  // Added to match usage in components
  total?: number;       // Added to match usage in components
  image_url?: string;   // Added to fix image rendering issues
}

export interface Product {
  id: string;
  name: string;
  reference?: string;
  category?: string;
  price: number;
  purchase_price?: number;
  stock?: number;
  image_url?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}
