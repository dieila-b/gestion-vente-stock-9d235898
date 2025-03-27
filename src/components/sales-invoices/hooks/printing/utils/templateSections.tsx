
import { formatGNF } from "@/lib/currency";
import { numberToWords } from "@/lib/numberToWords";

/**
 * Generate the header section of the invoice
 */
export function generateHeader(): string {
  return `
    <div class="header">
      <div class="logo-container">
        <img src="/lovable-uploads/a4c01cc2-c7e7-4877-b12e-00121b9e346b.png" alt="Logo" class="logo">
      </div>
      <div class="company-info">
        <h2>Information de la société</h2>
        <p><strong>Nom:</strong> Ets Aicha Business Alphaya</p>
        <p><strong>Adresse:</strong> Madina-Gare routière Kankan C/Matam</p>
        <p><strong>Téléphone:</strong> +224 613 98 11 24 / 625 72 76 93</p>
        <p><strong>Email:</strong> etsaichabusinessalphaya@gmail.com</p>
      </div>
    </div>
  `;
}

/**
 * Generate the invoice details section
 */
export function generateInvoiceDetails(formattedDate: string, invoiceNumber: string, selectedInvoice: any): string {
  return `
    <div class="invoice-title">FACTURE</div>
    
    <div class="invoice-details">
      <div class="invoice-number">
        <p><strong>DATE:</strong> ${formattedDate}</p>
        <p><strong>FACTURE N°:</strong> ${invoiceNumber}</p>
      </div>
      
      <div class="client-info">
        <h3>CLIENT:</h3>
        <p><strong>Nom:</strong> ${selectedInvoice.client?.company_name || selectedInvoice.client?.contact_name || "CLIENT COMPTOIR"}</p>
        <p><strong>Téléphone:</strong> ${selectedInvoice.client?.phone || ""}</p>
        <p><strong>Adresse:</strong> ${selectedInvoice.client?.address || ""}</p>
        <p><strong>Email:</strong> ${selectedInvoice.client?.email || ""}</p>
        ${selectedInvoice.client?.client_code ? `<p><strong>Code:</strong> ${selectedInvoice.client?.client_code}</p>` : ''}
      </div>
    </div>
  `;
}

/**
 * Generate the summary table
 */
export function generateSummaryTable(subtotalBeforeDiscount: number, totalDiscount: number, selectedInvoice: any): string {
  return `
    <div style="display: flex; justify-content: flex-end;">
      <table class="summary-table" style="width: auto;">
        <tr>
          <td><strong>Montant Total</strong></td>
          <td style="text-align: right; width: 120px;">${formatGNF(subtotalBeforeDiscount)}</td>
        </tr>
        <tr>
          <td><strong>Remise</strong></td>
          <td style="text-align: right;">${formatGNF(totalDiscount)}</td>
        </tr>
        <tr>
          <td><strong>Net à Payer</strong></td>
          <td style="text-align: right;">${formatGNF(selectedInvoice.final_total)}</td>
        </tr>
      </table>
    </div>
  `;
}

/**
 * Generate the amount in words section
 */
export function generateAmountInWords(selectedInvoice: any): string {
  return `
    <div class="amount-in-words">
      <p><strong>Arrêtée la présente facture à la somme de:</strong> ${numberToWords(selectedInvoice.final_total)} Franc Guinéen</p>
    </div>
  `;
}

/**
 * Generate the payment status section
 */
export function generatePaymentStatus(selectedInvoice: any, getDeliveryStatusLabel: (status: string | null) => string): string {
  return `
    <div class="payment-status">
      <div class="status-box">
        <div class="status-title">Statut de paiement</div>
        <div class="status-details">
          <span>Status:</span>
          <span><strong>${selectedInvoice.payment_status === 'paid' 
              ? 'Payé'
              : selectedInvoice.payment_status === 'partial'
              ? 'Partiellement payé'
              : 'En attente de paiement'}</strong></span>
        </div>
        <div class="status-details">
          <span>Montant payé:</span>
          <span><strong>${formatGNF(selectedInvoice.paid_amount || 0)}</strong></span>
        </div>
        <div class="status-details">
          <span>Reste à payer:</span>
          <span><strong>${formatGNF(selectedInvoice.remaining_amount || 0)}</strong></span>
        </div>
        
        ${selectedInvoice.payment_status === 'partial' ? `
        <div class="notification payment">
          <div style="display: flex; align-items: center;">
            <span class="status-icon">⚠️</span>
            <span>Un paiement partiel a été effectué pour cette facture.</span>
          </div>
        </div>
        ` : ''}
      </div>
      
      <div class="status-box">
        <div class="status-title">Statut de livraison</div>
        <div class="status-details">
          <span>Status:</span>
          <span><strong>${getDeliveryStatusLabel(selectedInvoice.delivery_status)}</strong></span>
        </div>
        
        ${selectedInvoice.delivery_status === 'partial' ? `
        <div class="notification delivery">
          <div style="display: flex; align-items: center;">
            <span class="status-icon">🚚</span>
            <span>Cette commande a été partiellement livrée.</span>
          </div>
        </div>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Generate the signature section
 */
export function generateSignatureSection(): string {
  return `
    <div style="margin-top: 40px; display: flex; justify-content: space-between;">
      <div style="width: 45%;">
        <p><strong>Signature du Client</strong></p>
        <div style="height: 60px; border-bottom: 1px dashed #ccc;"></div>
      </div>
      <div style="width: 45%; text-align: right;">
        <p><strong>Signature du Vendeur</strong></p>
        <div style="height: 60px; border-bottom: 1px dashed #ccc;"></div>
      </div>
    </div>
    
    <div style="margin-top: 30px; text-align: center; font-size: 11px; color: #666; border-top: 1px solid #ccc; padding-top: 10px;">
      <p>DEMO SARL - Numéro RCCM: GC-KAL/RCCM/2011-A-9908 - NIF: 123456789</p>
    </div>
  `;
}

/**
 * Generate the print script
 */
export function generatePrintScript(): string {
  return `
    <script>
      // Focus on the window and delay printing to ensure all content is loaded
      window.focus();
      setTimeout(function() {
        window.print();
      }, 1000);
    </script>
  `;
}
