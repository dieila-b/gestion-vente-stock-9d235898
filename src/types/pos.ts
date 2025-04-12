
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url?: string;
  stock?: number;
  reference?: string;
  created_at?: string;
  updated_at?: string;
  product_id?: string;
}

export interface CartItem extends Product {
  quantity: number;
  discount: number;
  product_id: string; // Required property
  subtotal?: number;
  image?: string;
}

export interface Order {
  id: string;
  total: number;
  discount: number;
  final_total: number;
  status: string;
  delivery_status?: string;
  client_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  total: number;
  discount?: number;
  delivered_quantity?: number;
  delivery_status?: string;
  created_at?: string;
}
