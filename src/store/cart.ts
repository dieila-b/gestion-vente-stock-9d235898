
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

interface CartStore {
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
      
      addItem: (product, stock = 0) => {
        const { cart } = get();
        const existingItem = cart.items.find(item => item.id === product.id);
        
        if (existingItem) {
          // Update quantity if item exists
          const updatedItems = cart.items.map(item => 
            item.id === product.id 
              ? { ...item, quantity: item.quantity + 1 } 
              : item
          );
          
          set(state => ({
            ...state,
            cart: {
              ...cart,
              items: updatedItems,
              subtotal: calculateSubtotal(updatedItems),
              total: calculateTotal(updatedItems, cart.discount)
            }
          }));
        } else {
          // Add new item
          const newItem: CartItem = {
            id: product.id,
            product_id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            discount: 0,
            category: product.category || "",
            stock: stock || product.stock || 0,
            reference: product.reference,
            image_url: product.image_url,
            created_at: product.created_at,
            updated_at: product.updated_at
          };
          
          const updatedItems = [...cart.items, newItem];
          
          set(state => ({
            ...state,
            cart: {
              ...cart,
              items: updatedItems,
              subtotal: calculateSubtotal(updatedItems),
              total: calculateTotal(updatedItems, cart.discount)
            }
          }));
        }
      },
      
      removeItem: (id) => {
        const { cart } = get();
        const updatedItems = cart.items.filter(item => item.id !== id);
        
        set(state => ({
          ...state,
          cart: {
            ...cart,
            items: updatedItems,
            subtotal: calculateSubtotal(updatedItems),
            total: calculateTotal(updatedItems, cart.discount)
          }
        }));
      },
      
      updateQuantity: (id, delta) => {
        const { cart } = get();
        const updatedItems = cart.items.map(item => {
          if (item.id === id) {
            const newQuantity = Math.max(1, item.quantity + delta);
            return { ...item, quantity: newQuantity };
          }
          return item;
        });
        
        set(state => ({
          ...state,
          cart: {
            ...cart,
            items: updatedItems,
            subtotal: calculateSubtotal(updatedItems),
            total: calculateTotal(updatedItems, cart.discount)
          }
        }));
      },
      
      setQuantity: (id, quantity) => {
        const { cart } = get();
        const updatedItems = cart.items.map(item => {
          if (item.id === id) {
            // Créer un nouvel objet pour s'assurer que React détecte le changement
            return { ...item, quantity: Math.max(1, quantity) };
          }
          return item;
        });
        
        set(state => ({
          ...state,
          cart: {
            ...cart,
            items: updatedItems,
            subtotal: calculateSubtotal(updatedItems),
            total: calculateTotal(updatedItems, cart.discount)
          }
        }));
      },
      
      updateDiscount: (id, discount) => {
        const { cart } = get();
        const updatedItems = cart.items.map(item => {
          if (item.id === id) {
            return { ...item, discount };
          }
          return item;
        });
        
        set(state => ({
          ...state,
          cart: {
            ...cart,
            items: updatedItems,
            subtotal: calculateSubtotal(updatedItems),
            total: calculateTotal(updatedItems, cart.discount)
          }
        }));
      },
      
      addClient: (client) => {
        const { cart } = get();
        set(state => ({
          ...state,
          cart: {
            ...cart,
            client
          }
        }));
      },
      
      removeClient: () => {
        const { cart } = get();
        set(state => ({
          ...state,
          cart: {
            ...cart,
            client: null
          }
        }));
      },
      
      clearCart: () => {
        set(state => ({
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
      },
      
      updateNotes: (notes) => {
        const { cart } = get();
        set(state => ({
          ...state,
          cart: {
            ...cart,
            notes
          }
        }));
      },
      
      setCart: (items: CartItem[]) => {
        const { cart } = get();
        set(state => ({
          ...state,
          cart: {
            ...cart,
            items,
            subtotal: calculateSubtotal(items),
            total: calculateTotal(items, cart.discount)
          }
        }));
      }
    }),
    {
      name: 'cart-storage',
    }
  )
);

// Helper functions for calculations
function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function calculateTotal(items: CartItem[], globalDiscount: number): number {
  const subtotal = calculateSubtotal(items);
  
  // Calculate item-specific discounts
  const itemDiscounts = items.reduce((sum, item) => {
    return sum + (item.discount || 0) * item.quantity;
  }, 0);
  
  return Math.max(0, subtotal - itemDiscounts - globalDiscount);
}
