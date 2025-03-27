
import { invoicePrintStyles } from "./invoicePrintStyles";
import { generateItemRows } from "./utils/itemRowsGenerator";
import { 
  generateHeader, 
  generateInvoiceDetails, 
  generateSummaryTable, 
  generateAmountInWords, 
  generatePaymentStatus, 
  generateSignatureSection,
  generatePrintScript
} from "./utils/templateSections";
import { generateHtmlStructure } from "./utils/htmlStructure";
import { calculateSubtotalBeforeDiscount, calculateTotalDiscount } from "./utils/calculationUtils";

export function generateInvoiceTemplate(
  selectedInvoice: any,
  formattedDate: string,
  invoiceNumber: string,
  subtotalBeforeDiscount: number,
  totalDiscount: number,
  itemRows: string,
  getDeliveryStatusLabel: (status: string | null) => string
): string {
  // Build the invoice content
  const content = `
    ${generateHeader()}
    
    ${generateInvoiceDetails(formattedDate, invoiceNumber, selectedInvoice)}
    
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
    
    ${generateSummaryTable(subtotalBeforeDiscount, totalDiscount, selectedInvoice)}
    
    ${generateAmountInWords(selectedInvoice)}
    
    ${generatePaymentStatus(selectedInvoice, getDeliveryStatusLabel)}
    
    ${generateSignatureSection()}
    
    ${generatePrintScript()}
  `;

  // Return the complete HTML document
  return generateHtmlStructure(invoiceNumber, content);
}

export { generateItemRows };
export { calculateSubtotalBeforeDiscount, calculateTotalDiscount };
