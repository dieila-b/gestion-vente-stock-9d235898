
import { formatGNF } from "@/lib/currency";

export function generateItemRows(items: any[]): string {
  return items.map((item: any) => {
    // Original price, discount and net price calculations
    const originalPrice = item.price || 0;
    const discount = item.discount || 0;
    const netPrice = Math.max(0, originalPrice - discount);
    
    // Total price calculation (original price * quantity)
    const totalPrice = originalPrice * item.quantity;
    
    // Delivery details
    const orderedQty = item.quantity;
    const deliveredQty = item.delivered_quantity || 0;
    const remainingQty = orderedQty - deliveredQty;
    
    // Product display with placeholders for images that don't load
    const productImage = item.product?.image_url 
      ? `<div class="image-placeholder">📷</div>`
      : `<div class="image-placeholder">📷</div>`;
    
    return `
      <tr>
        <td>
          <div style="display: flex; align-items: center;">
            ${productImage}
            <span>${item.product?.name || 'Produit inconnu'}</span>
          </div>
        </td>
        <td style="text-align: right;">${formatGNF(originalPrice)}</td>
        <td style="text-align: center;">${discount > 0 ? formatGNF(discount) : "-"}</td>
        <td style="text-align: right;">${formatGNF(netPrice)}</td>
        <td style="text-align: center;">${item.quantity}</td>
        <td style="text-align: center; color: green;">${deliveredQty}</td>
        <td style="text-align: center; color: orange;">${remainingQty}</td>
        <td style="text-align: right;">${formatGNF(totalPrice)}</td>
      </tr>
    `;
  }).join('');
}
