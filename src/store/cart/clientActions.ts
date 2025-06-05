
import { Client } from '@/types/client';

export const createClientActions = (set: any, get: any) => ({
  addClient: (client: Client) => {
    const { cart } = get();
    set((state: any) => ({
      ...state,
      cart: {
        ...cart,
        client
      }
    }));
  },

  removeClient: () => {
    const { cart } = get();
    set((state: any) => ({
      ...state,
      cart: {
        ...cart,
        client: null
      }
    }));
  }
});
