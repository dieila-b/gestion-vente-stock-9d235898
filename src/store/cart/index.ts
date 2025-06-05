
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartStore } from './types';
import { createCartActions } from './actions';
import { createClientActions } from './clientActions';
import { createUtilityActions } from './utilityActions';

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: {
        items: [],
        client: null,
        discount: 0,
        subtotal: 0,
        total: 0,
        notes: '',
      },
      
      ...createCartActions(set, get),
      ...createClientActions(set, get),
      ...createUtilityActions(set, get),
    }),
    {
      name: 'cart-storage',
    }
  )
);

// Re-export types for convenience
export type { CartState, CartStore } from './types';
