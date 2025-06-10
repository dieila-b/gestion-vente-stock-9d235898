
import { CartItem } from '@/types/pos';
import { calculateSubtotal, calculateTotal } from './calculations';

export const createUtilityActions = (set: any, get: any) => ({
  clearCart: () => {
    console.log('=== DÉBUT DE clearCart() ===');
    console.log('État du cart avant vidage:', get().cart);
    
    try {
      set((state: any) => {
        const newState = {
          ...state,
          cart: {
            items: [],
            client: null,
            discount: 0,
            subtotal: 0,
            total: 0,
            notes: ''
          }
        };
        console.log('Nouvel état du cart après vidage:', newState.cart);
        return newState;
      });
      
      console.log('=== clearCart() TERMINÉ AVEC SUCCÈS ===');
      
      // Vérification après mise à jour
      setTimeout(() => {
        const currentState = get();
        console.log('État du cart après clearCart (vérification):', currentState.cart);
      }, 100);
      
    } catch (error) {
      console.error('=== ERREUR DANS clearCart() ===');
      console.error('Error:', error);
    }
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
