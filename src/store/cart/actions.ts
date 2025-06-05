
import { CartItem } from '@/types/pos';
import { Client } from '@/types/client';
import { CartState } from './types';
import { calculateSubtotal, calculateTotal } from './calculations';

export const createCartActions = (set: any, get: any) => ({
  addItem: (product: any, stock = 0) => {
    const { cart } = get();
    const existingItem = cart.items.find((item: CartItem) => item.id === product.id);
    
    if (existingItem) {
      const updatedItems = cart.items.map((item: CartItem) => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      );
      
      set((state: any) => ({
        ...state,
        cart: {
          ...cart,
          items: updatedItems,
          subtotal: calculateSubtotal(updatedItems),
          total: calculateTotal(updatedItems, cart.discount)
        }
      }));
    } else {
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
      
      set((state: any) => ({
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

  removeItem: (id: string) => {
    const { cart } = get();
    const updatedItems = cart.items.filter((item: CartItem) => item.id !== id);
    
    set((state: any) => ({
      ...state,
      cart: {
        ...cart,
        items: updatedItems,
        subtotal: calculateSubtotal(updatedItems),
        total: calculateTotal(updatedItems, cart.discount)
      }
    }));
  },

  updateQuantity: (id: string, delta: number) => {
    const { cart } = get();
    const updatedItems = cart.items.map((item: CartItem) => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    
    set((state: any) => ({
      ...state,
      cart: {
        ...cart,
        items: updatedItems,
        subtotal: calculateSubtotal(updatedItems),
        total: calculateTotal(updatedItems, cart.discount)
      }
    }));
  },

  setQuantity: (id: string, quantity: number) => {
    const { cart } = get();
    const updatedItems = cart.items.map((item: CartItem) => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, quantity) };
      }
      return item;
    });
    
    set((state: any) => ({
      ...state,
      cart: {
        ...cart,
        items: updatedItems,
        subtotal: calculateSubtotal(updatedItems),
        total: calculateTotal(updatedItems, cart.discount)
      }
    }));
  },

  updateDiscount: (id: string, discount: number) => {
    const { cart } = get();
    const updatedItems = cart.items.map((item: CartItem) => {
      if (item.id === id) {
        return { ...item, discount };
      }
      return item;
    });
    
    set((state: any) => ({
      ...state,
      cart: {
        ...cart,
        items: updatedItems,
        subtotal: calculateSubtotal(updatedItems),
        total: calculateTotal(updatedItems, cart.discount)
      }
    }));
  }
});
