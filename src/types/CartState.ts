
import { CartItem as PosCartItem } from "./pos";

export interface CartItem extends PosCartItem {
  subtotal: number; // Make this required instead of optional
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
