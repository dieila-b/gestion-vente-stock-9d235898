
import { CartItem } from "@/types/pos";

/**
 * Calculate subtotal before discount from all items
 */
export function calculateSubTotal(items: CartItem[]): number {
  return items.reduce((acc: number, item: CartItem) => {
    return acc + (item.price * item.quantity);
  }, 0);
}

/**
 * Calculate total discount from all items
 */
export function calculateTotalDiscount(items: CartItem[]): number {
  return items.reduce((acc: number, item: CartItem) => {
    const itemDiscount = (item.discount || 0) * item.quantity;
    return acc + itemDiscount;
  }, 0);
}
