
/**
 * Calculate subtotal before discount from all items
 */
export function calculateSubtotalBeforeDiscount(items: any[]): number {
  return items.reduce((acc: number, item: any) => {
    return acc + (item.price * item.quantity);
  }, 0);
}

/**
 * Calculate total discount from all items
 */
export function calculateTotalDiscount(items: any[]): number {
  return items.reduce((acc: number, item: any) => {
    const itemDiscount = (item.discount || 0) * item.quantity;
    return acc + itemDiscount;
  }, 0);
}
