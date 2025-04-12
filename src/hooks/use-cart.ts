
import { useState } from "react";
import { CartItem, Product } from "@/types/pos";
import { toast } from "sonner";

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  // Track available stock separately from the product's stock
  const [availableStock, setAvailableStock] = useState<Record<string, number>>({});

  // Initialize or update available stock for a product
  const updateAvailableStock = (productId: string, stock: number) => {
    setAvailableStock(current => ({
      ...current,
      [productId]: stock
    }));
  };

  // Get current available stock for a product
  const getAvailableStock = (productId: string) => {
    return availableStock[productId] !== undefined 
      ? availableStock[productId] 
      : 0;
  };

  const addToCart = (product: Product, initialStock?: number) => {
    // Initialize stock if needed
    if (initialStock !== undefined && availableStock[product.id] === undefined) {
      updateAvailableStock(product.id, initialStock);
    }

    const currentAvailableStock = getAvailableStock(product.id);

    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.id === product.id);
      
      // Check if adding would exceed available stock
      if (currentAvailableStock <= 0) {
        toast.error("Stock insuffisant pour cet article");
        return currentCart;
      }
      
      // Update available stock
      updateAvailableStock(product.id, currentAvailableStock - 1);
      
      if (existingItem) {
        return currentCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...currentCart, { 
        ...product, 
        quantity: 1, 
        discount: 0,
        image_url: product.image_url,
        product_id: product.id || product.product_id || '', // Ensure product_id is set
        subtotal: product.price,
      } as CartItem];
    });
  };

  const removeFromCart = (productId: string) => {
    // Get the item being removed to restore stock
    const itemToRemove = cart.find(item => item.id === productId);
    
    if (itemToRemove) {
      // Restore stock when removing item
      const currentStock = getAvailableStock(productId);
      updateAvailableStock(productId, currentStock + itemToRemove.quantity);
    }
    
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    // Get current stock
    const currentStock = getAvailableStock(productId);
    
    // Get the current item
    const currentItem = cart.find(item => item.id === productId);
    if (!currentItem) return;
    
    // Check if increasing quantity
    if (delta > 0) {
      // Check if we have enough stock
      if (currentStock <= 0) {
        toast.error("Stock insuffisant pour cet article");
        return;
      }
      
      // Decrease available stock
      updateAvailableStock(productId, currentStock - 1);
    } else if (delta < 0) {
      // Increase available stock when decreasing quantity
      updateAvailableStock(productId, currentStock + 1);
    }
    
    setCart(currentCart =>
      currentCart.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const setQuantity = (productId: string, quantity: number) => {
    // Get the current item
    const currentItem = cart.find(item => item.id === productId);
    if (!currentItem) return;
    
    // Calculate delta
    const delta = quantity - currentItem.quantity;
    
    // If increasing, check stock
    if (delta > 0) {
      const currentStock = getAvailableStock(productId);
      if (currentStock < delta) {
        toast.error("Stock insuffisant pour cette quantité");
        return;
      }
      
      // Update available stock
      updateAvailableStock(productId, currentStock - delta);
    } else if (delta < 0) {
      // Restore stock
      const currentStock = getAvailableStock(productId);
      updateAvailableStock(productId, currentStock - delta); // Negative delta means adding to stock
    }
    
    setCart(currentCart =>
      currentCart.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const updateDiscount = (productId: string, discount: number) => {
    setCart(currentCart =>
      currentCart.map(item =>
        item.id === productId
          ? { ...item, discount: Math.max(0, discount) }
          : item
      )
    );
  };

  const clearCart = () => {
    // Restore all stock when clearing the cart
    cart.forEach(item => {
      const currentStock = getAvailableStock(item.id);
      updateAvailableStock(item.id, currentStock + item.quantity);
    });
    
    setCart([]);
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTotalDiscount = () => {
    // Multiply discount by quantity for each item
    return cart.reduce((total, item) => total + ((item.discount || 0) * item.quantity), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateTotalDiscount();
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    setQuantity,
    updateDiscount,
    setCart,
    clearCart,
    calculateSubtotal,
    calculateTotal,
    calculateTotalDiscount,
    availableStock,
    updateAvailableStock,
    getAvailableStock
  };
}
