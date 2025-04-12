import { create } from 'zustand';
import { Client } from '@/types/client';
import { CartItem } from '@/types/pos';

export interface CartState {
  items: CartItem[];
  client: Client | null;
  notes: string;
  subtotal: number;
  discount: number;
  total: number;
}

interface CartStore {
  cart: CartState;
  addItem: (item: any, currentStock?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  updateDiscount: (id: string, discount: number) => void;
  addClient: (client: Client) => void;
  removeClient: () => void;
  updateNotes: (notes: string) => void;
  clearCart: () => void;
  setCart: (items: CartItem[]) => void;
}

const initialState: CartState = {
  items: [],
  client: null,
  notes: '',
  subtotal: 0,
  discount: 0,
  total: 0
};

const calculateSubtotal = (items: CartItem[]) => {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

const calculateDiscount = (items: CartItem[]) => {
  return items.reduce((sum, item) => sum + (item.discount || 0), 0);
};

const calculateTotal = (subtotal: number, discount: number) => {
  return Math.max(0, subtotal - discount);
};

export const useCartStore = create<CartStore>((set) => ({
  cart: initialState,
  
  addItem: (item, currentStock = 0) => set((state) => {
    const existingItem = state.cart.items.find(i => i.id === item.id);
    
    let updatedItems = [];
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + 1;
      if (currentStock !== undefined && newQuantity > currentStock) {
        updatedItems = [...state.cart.items];
      } else {
        updatedItems = state.cart.items.map(i => 
          i.id === item.id 
            ? { ...i, quantity: newQuantity } 
            : i
        );
      }
    } else {
      const newItem = {
        ...item,
        quantity: 1,
        discount: 0,
        product_id: item.id,
        category: item.category || '',
        subtotal: item.price
      };
      updatedItems = [...state.cart.items, newItem];
    }
    
    const subtotal = calculateSubtotal(updatedItems);
    const discount = calculateDiscount(updatedItems);
    const total = calculateTotal(subtotal, discount);
    
    return {
      cart: {
        ...state.cart,
        items: updatedItems,
        subtotal,
        discount,
        total
      }
    };
  }),
  
  removeItem: (id) => set((state) => {
    const updatedItems = state.cart.items.filter(item => item.id !== id);
    const subtotal = calculateSubtotal(updatedItems);
    const discount = calculateDiscount(updatedItems);
    const total = calculateTotal(subtotal, discount);
    
    return {
      cart: {
        ...state.cart,
        items: updatedItems,
        subtotal,
        discount,
        total
      }
    };
  }),
  
  updateQuantity: (id, delta) => set((state) => {
    const updatedItems = state.cart.items.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return {
          ...item,
          quantity: newQuantity,
          subtotal: newQuantity * item.price
        };
      }
      return item;
    });
    
    const subtotal = calculateSubtotal(updatedItems);
    const discount = calculateDiscount(updatedItems);
    const total = calculateTotal(subtotal, discount);
    
    return {
      cart: {
        ...state.cart,
        items: updatedItems,
        subtotal,
        discount,
        total
      }
    };
  }),
  
  setQuantity: (id, quantity) => set((state) => {
    const updatedItems = state.cart.items.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, quantity);
        return {
          ...item,
          quantity: newQuantity,
          subtotal: newQuantity * item.price
        };
      }
      return item;
    });
    
    const subtotal = calculateSubtotal(updatedItems);
    const discount = calculateDiscount(updatedItems);
    const total = calculateTotal(subtotal, discount);
    
    return {
      cart: {
        ...state.cart,
        items: updatedItems,
        subtotal,
        discount,
        total
      }
    };
  }),
  
  updateDiscount: (id, discount) => set((state) => {
    const updatedItems = state.cart.items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          discount
        };
      }
      return item;
    });
    
    const subtotal = calculateSubtotal(updatedItems);
    const totalDiscount = calculateDiscount(updatedItems);
    const total = calculateTotal(subtotal, totalDiscount);
    
    return {
      cart: {
        ...state.cart,
        items: updatedItems,
        subtotal,
        discount: totalDiscount,
        total
      }
    };
  }),
  
  addClient: (client) => set((state) => ({
    cart: {
      ...state.cart,
      client
    }
  })),
  
  removeClient: () => set((state) => ({
    cart: {
      ...state.cart,
      client: null
    }
  })),
  
  updateNotes: (notes) => set((state) => ({
    cart: {
      ...state.cart,
      notes
    }
  })),
  
  clearCart: () => set({
    cart: initialState
  }),
  
  setCart: (items) => set((state) => {
    const updatedItems = items.map(item => ({
      ...item,
      product_id: item.product_id || item.id,
      category: item.category || '',
      subtotal: item.price * item.quantity
    }));
    
    const subtotal = calculateSubtotal(updatedItems);
    const discount = calculateDiscount(updatedItems);
    const total = calculateTotal(subtotal, discount);
    
    return {
      cart: {
        ...state.cart,
        items: updatedItems,
        subtotal,
        discount,
        total
      }
    };
  })
}));
