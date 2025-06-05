
import { CartItem } from '@/types/pos';

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

export function calculateTotal(items: CartItem[], globalDiscount: number): number {
  const subtotal = calculateSubtotal(items);
  
  // Calculate item-specific discounts
  const itemDiscounts = items.reduce((sum, item) => {
    return sum + (item.discount || 0) * item.quantity;
  }, 0);
  
  return Math.max(0, subtotal - itemDiscounts - globalDiscount);
}
