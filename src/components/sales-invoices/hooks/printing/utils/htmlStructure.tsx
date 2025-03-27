
import { invoicePrintStyles } from "../invoicePrintStyles";

/**
 * Generate the HTML document structure for the invoice
 */
export function generateHtmlStructure(invoiceNumber: string, content: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Facture ${invoiceNumber}</title>
        <meta charset="UTF-8">
        <style>
          ${invoicePrintStyles}
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <button onclick="window.print();" style="margin: 20px auto; padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; display: block;">Imprimer</button>
          
          ${content}
        </div>
      </body>
    </html>
  `;
}
