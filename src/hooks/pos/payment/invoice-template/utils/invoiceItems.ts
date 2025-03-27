
import { formatGNF } from "@/lib/currency";
import { CartItem } from "@/types/pos";

/**
 * Generate HTML table rows for each product in the invoice
 */
export function generateItemRows(
  items: CartItem[],
  deliveredItems?: Record<string, { delivered: boolean, quantity: number }>
): string {
  return items.map((item, index) => {
    // Pricing calculations
    const originalPrice = item.price || 0;
    const discount = item.discount || 0;
    const netPrice = Math.max(0, originalPrice - discount);
    
    // Quantity tracking
    const orderedQty = item.quantity;
    let deliveredQty = 0;
    
    // If we have delivery information, use it
    if (deliveredItems && deliveredItems[item.id]) {
      deliveredQty = deliveredItems[item.id].quantity;
    }
    
    const remainingQty = orderedQty - deliveredQty;
    
    // Product image handling
    let imageUrl = null;
    if (item.image_url) {
      imageUrl = item.image_url;
    }
    
    const productImage = imageUrl 
      ? `<img src="${imageUrl}" alt="${item.name}" style="width: 40px; height: 40px; object-fit: contain; margin-right: 5px;">`
      : '';
    
    return `
      <tr>
        <td>
          <div style="display: flex; align-items: center;">
            ${productImage}
            <span>${item.name}</span>
          </div>
        </td>
        <td style="text-align: right;">${formatGNF(originalPrice)}</td>
        <td style="text-align: right;">${discount > 0 ? formatGNF(discount) : "-"}</td>
        <td style="text-align: right;">${formatGNF(netPrice)}</td>
        <td style="text-align: center;">${item.quantity}</td>
        <td style="text-align: center;">${deliveredQty}</td>
        <td style="text-align: center;">${remainingQty}</td>
        <td style="text-align: right;">${formatGNF(originalPrice * item.quantity)}</td>
      </tr>
    `;
  }).join('');
}
