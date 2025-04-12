
import { CartItem } from "./pos";

export interface CartState {
  items: CartItem[];
  total: number;
  subtotal: number;
  discount: number;
}
