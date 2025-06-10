
import { CartItem } from '@/types/pos';
import { calculateSubtotal, calculateTotal } from './calculations';

export const createUtilityActions = (set: any, get: any) => ({
  clearCart: () => {
    console.log('Clearing cart...');
    set((state: any) => ({
      ...state,
      cart: {
        items: [],
        client: null,
        discount: 0,
        subtotal: 0,
        total: 0,
        notes: ''
      }
    }));
    console.log('Cart cleared successfully');
  },

  updateNotes: (notes: string) => {
    const { cart } = get();
    set((state: any) => ({
      ...state,
      cart: {
        ...cart,
        notes
      }
    }));
  },

  setCart: (items: CartItem[]) => {
    const { cart } = get();
    set((state: any) => ({
      ...state,
      cart: {
        ...cart,
        items,
        subtotal: calculateSubtotal(items),
        total: calculateTotal(items, cart.discount)
      }
    }));
  }
});
