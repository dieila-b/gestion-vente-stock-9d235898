
import { CartItem } from '@/types/pos';
import { Client } from '@/types/client';

export interface CartState {
  items: CartItem[];
  client: Client | null;
  discount: number;
  subtotal: number;
  total: number;
  notes: string;
}

export interface CartStore {
  cart: CartState;
  addItem: (product: any, stock?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  updateDiscount: (id: string, discount: number) => void;
  addClient: (client: Client) => void;
  removeClient: () => void;
  clearCart: () => void;
  updateNotes: (notes: string) => void;
  setCart: (items: CartItem[]) => void;
}
