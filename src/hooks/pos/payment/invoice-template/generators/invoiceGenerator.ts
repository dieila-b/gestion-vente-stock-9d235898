
import { CartItem } from "@/types/pos";
import { Client } from "@/types/client";
import { generateItemRows } from "../utils/invoiceItems";
import { generateHtmlStructure } from "../utils/documentStructure";
import { calculateSubTotal, calculateTotalDiscount } from "../utils/calculations";
import { 
  generateHeaderSection,
  generateInvoiceDetails 
} from "../utils/invoiceHeader";
import {
  generateStatusSection
} from "../utils/statusSection";
import {
  generateSummaryTable,
  generateAmountInWords
} from "../utils/invoiceSummary";
import {
  generateSignatureSection,
  generatePrintScript
} from "../utils/footerSection";

/**
 * Generate complete HTML for the invoice
 */
export function generateInvoiceHTML(
  invoiceNumber: string, 
  date: string, 
  items: CartItem[], 
  total: number, 
  client: Client | null,
  paymentStatus: 'paid' | 'partial' | 'pending' = 'pending',
  paidAmount: number = 0,
  remainingAmount: number = 0,
  deliveryStatus: 'delivered' | 'partial' | 'pending' | 'awaiting' = 'pending',
  deliveredItems?: Record<string, { delivered: boolean, quantity: number }>
): string {
  // Calculate subtotal and total discount
  const subtotal = calculateSubTotal(items);
  const totalDiscount = calculateTotalDiscount(items);
  
  // Generate rows for each product
  const itemRows = generateItemRows(items, deliveredItems);

  // Build the invoice content
  const content = `
    ${generateHeaderSection()}
    
    ${generateInvoiceDetails(date, invoiceNumber, client)}
    
    <table>
      <thead>
        <tr>
          <th>Produit</th>
          <th>Prix unitaire</th>
          <th>Remise</th>
          <th>Prix net</th>
          <th>Qté</th>
          <th>Livré</th>
          <th>Restant</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>
    
    ${generateSummaryTable(subtotal, totalDiscount, total)}
    
    ${generateAmountInWords(total)}
    
    ${generateStatusSection(paymentStatus, paidAmount, remainingAmount, deliveryStatus)}
    
    ${generateSignatureSection()}
    
    ${generatePrintScript()}
  `;

  // Return the complete HTML document
  return generateHtmlStructure(invoiceNumber, content);
}
