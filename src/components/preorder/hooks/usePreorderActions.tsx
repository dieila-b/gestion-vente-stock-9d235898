
import { useState, useCallback } from 'react';
import { Client } from '@/types/client';
import { CartItem, Product } from '@/types/pos';
import { toast } from 'sonner';

export function usePreorderActions(initialClient: Client | null, initialCart: CartItem[] = []) {
  const [client, setClient] = useState<Client | null>(initialClient || null);
  const [cart, setCart] = useState<CartItem[]>(initialCart || []);

  // Update cart when initialCart changes (for editing)
  useState(() => {
    if (initialCart && initialCart.length > 0) {
      setCart(initialCart);
    }
  });

  // Update client when initialClient changes (for editing)
  useState(() => {
    if (initialClient) {
      setClient(initialClient);
    }
  });

  const addToCart = useCallback((product: Product) => {
    setCart(prevCart => {
      // Check if product is already in cart
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        // Update quantity of existing item
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.price * (item.quantity + 1)) }
            : item
        );
      } else {
        // Add new item to cart
        const newItem: CartItem = {
          id: product.id,
          name: product.name,
          price: product.price || 0,
          quantity: 1,
          unit_price: product.price || 0,
          original_price: product.price || 0,
          discounted_price: product.price || 0,
          discount: 0,
          total: product.price || 0,
          category: product.category || '',
          reference: product.reference || '',
          stock: product.stock || 0
        };
        
        return [...prevCart, newItem];
      }
    });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) {
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id
          ? { 
              ...item, 
              quantity, 
              total: (item.price * quantity)
            }
          : item
      )
    );
  }, []);

  const setCartItemQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) return;
    updateQuantity(id, quantity);
  }, [updateQuantity]);

  const removeFromCart = useCallback((id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  }, []);

  const updateDiscount = useCallback((id: string, discount: number) => {
    setCart(prevCart =>
      prevCart.map(item => {
        if (item.id === id) {
          const maxDiscount = item.price;
          const safeDiscount = Math.min(Math.max(0, discount), maxDiscount);
          const discountedPrice = item.price - safeDiscount;
          
          return {
            ...item,
            discount: safeDiscount,
            discounted_price: discountedPrice,
            total: discountedPrice * item.quantity
          };
        }
        return item;
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const calculateSubtotal = useCallback(() => {
    return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [cart]);

  const calculateTotalDiscount = useCallback(() => {
    return cart.reduce((acc, item) => acc + (item.discount * item.quantity), 0);
  }, [cart]);

  const calculateTotal = useCallback(() => {
    return cart.reduce((acc, item) => acc + item.total, 0);
  }, [cart]);

  const validatePreorder = useCallback(() => {
    if (!client) {
      toast.error("Veuillez sélectionner un client pour la précommande");
      return false;
    }
    
    if (cart.length === 0) {
      toast.error("Votre précommande est vide");
      return false;
    }
    
    return true;
  }, [client, cart]);

  return {
    client,
    setClient,
    cart,
    setCart,
    addToCart,
    updateQuantity,
    setCartItemQuantity,
    removeFromCart, 
    updateDiscount,
    clearCart,
    calculateSubtotal,
    calculateTotalDiscount,
    calculateTotal,
    validatePreorder
  };
}
