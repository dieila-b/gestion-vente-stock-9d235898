
import { create } from 'zustand';
import { CartState, CartItem } from '@/types/CartState';
import { Client } from '@/types/client';
import { toast } from 'sonner';

interface CartStore {
  cart: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  addClient: (client: Client) => void;
  removeClient: () => void;
  clearCart: () => void;
  updateNotes: (notes: string) => void;
  updateDiscount: (discount: number) => void;
}

// Initialize an empty cart state
const initialCartState: CartState = {
  items: [],
  client: null,
  discount: 0,
  subtotal: 0,
  total: 0,
  notes: ''
};

// Create the cart store with Zustand
export const useCartStore = create<CartStore>((set, get) => ({
  cart: initialCartState,

  // Add a product to the cart
  addItem: (newItem: CartItem) => {
    set((state) => {
      // Check if the item already exists in the cart
      const existingItemIndex = state.cart.items.findIndex(
        (item) => item.product_id === newItem.product_id
      );

      let updatedItems: CartItem[];

      if (existingItemIndex !== -1) {
        // Update the quantity if the item exists
        updatedItems = [...state.cart.items];
        const existingItem = updatedItems[existingItemIndex];
        
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + newItem.quantity,
          subtotal: (existingItem.quantity + newItem.quantity) * existingItem.price
        };
        
        toast.success('Quantité mise à jour dans le panier');
      } else {
        // Add the new item
        updatedItems = [...state.cart.items, newItem];
        toast.success('Produit ajouté au panier');
      }

      // Calculate new totals
      const subtotal = updatedItems.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
      );

      const total = subtotal - state.cart.discount;

      return {
        cart: {
          ...state.cart,
          items: updatedItems,
          subtotal,
          total
        }
      };
    });
  },

  // Remove an item from the cart
  removeItem: (productId: string) => {
    set((state) => {
      const updatedItems = state.cart.items.filter(
        (item) => item.product_id !== productId
      );

      // Calculate new totals
      const subtotal = updatedItems.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
      );

      const total = subtotal - state.cart.discount;

      toast.info('Produit retiré du panier');

      return {
        cart: {
          ...state.cart,
          items: updatedItems,
          subtotal,
          total
        }
      };
    });
  },

  // Update the quantity of an item
  updateQuantity: (productId: string, quantity: number) => {
    set((state) => {
      const updatedItems = state.cart.items.map((item) => {
        if (item.product_id === productId) {
          return {
            ...item,
            quantity,
            subtotal: quantity * item.price
          };
        }
        return item;
      });

      // Calculate new totals
      const subtotal = updatedItems.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
      );

      const total = subtotal - state.cart.discount;

      return {
        cart: {
          ...state.cart,
          items: updatedItems,
          subtotal,
          total
        }
      };
    });
  },

  // Add a client to the cart
  addClient: (client: Client) => {
    set((state) => ({
      cart: {
        ...state.cart,
        client
      }
    }));
  },

  // Remove the client from the cart
  removeClient: () => {
    set((state) => ({
      cart: {
        ...state.cart,
        client: null
      }
    }));
  },

  // Clear the entire cart
  clearCart: () => {
    set({
      cart: initialCartState
    });
  },

  // Update cart notes
  updateNotes: (notes: string) => {
    set((state) => ({
      cart: {
        ...state.cart,
        notes
      }
    }));
  },

  // Update discount
  updateDiscount: (discount: number) => {
    set((state) => {
      const total = state.cart.subtotal - discount;

      return {
        cart: {
          ...state.cart,
          discount,
          total
        }
      };
    });
  }
}));
