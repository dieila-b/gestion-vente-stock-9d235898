
export interface Product {
  id: string;
  name: string;
  price: number;
  category?: string;
  reference?: string;
  image_url?: string;
  stock?: number;
}

export interface CartItem extends Product {
  quantity: number;
  discount?: number;
  deliveredQuantity?: number;
}

export interface CartSummary {
  subtotal: number;
  discount: number;
  total: number;
}
