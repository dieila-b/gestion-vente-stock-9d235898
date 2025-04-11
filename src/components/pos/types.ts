
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  discount?: number;
  category?: string;
  reference?: string;
  image_url?: string;
  deliveredQuantity?: number;
  stock?: number;
}
