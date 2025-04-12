
import { useCartStore } from "@/store/cart";
import { CartItem } from "@/types/pos";

export function useCart() {
  const cartStore = useCartStore();
  
  return {
    // Convert the cart items to the expected format
    cart: cartStore.cart.items as CartItem[],
    
    // Provide the expected functions with the right signatures
    addToCart: cartStore.addItem,
    removeFromCart: cartStore.removeItem,
    updateQuantity: cartStore.updateQuantity,
    updateDiscount: cartStore.updateDiscount,
    setQuantity: cartStore.setQuantity,
    clearCart: cartStore.clearCart,
    setCart: cartStore.setCart,
    
    // Calculate functions from the cart state
    calculateSubtotal: () => cartStore.cart.subtotal,
    calculateTotal: () => cartStore.cart.total,
    calculateTotalDiscount: () => cartStore.cart.discount,
  };
}
