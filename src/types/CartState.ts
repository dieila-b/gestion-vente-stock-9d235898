
import { CartItem as PosCartItem } from "./pos";

// Redefine CartItem to be fully compatible with types/pos.ts CartItem
export type CartItem = PosCartItem & {
  subtotal: number; // Required property in this context
};

export interface CartState {
  items: CartItem[];
  client: any | null;
  discount: number;
  subtotal: number;
  total: number;
  notes: string;
  [key: string]: any;
}
