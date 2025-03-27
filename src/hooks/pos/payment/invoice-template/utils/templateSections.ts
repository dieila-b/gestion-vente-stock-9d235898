
import { Client } from "@/types/client";
import { formatGNF } from "@/lib/currency";
import { getDeliveryStatusLabel } from "./deliveryStatus";

/**
 * Generate the header section of the invoice with company info
 */
export function generateHeaderSection(): string {
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
 * Generate the invoice details section including client info
 */
export function generateInvoiceDetails(
  date: string, 
  invoiceNumber: string,
  client: Client | null
): string {
  return `
    <div class="invoice-title">FACTURE</div>
    
    <div class="invoice-details">
      <div class="invoice-number">
        <p><strong>DATE:</strong> ${date}</p>
        <p><strong>FACTURE N°:</strong> ${invoiceNumber}</p>
      </div>
      
      <div class="client-info">
        <h3>CLIENT:</h3>
        <p><strong>Nom:</strong> ${client?.company_name || client?.contact_name || "CLIENT COMPTOIR"}</p>
        <p><strong>Téléphone:</strong> ${client?.phone || ""}</p>
        <p><strong>Adresse:</strong> ${client?.address || ""}</p>
        <p><strong>Email:</strong> ${client?.email || ""}</p>
        ${client?.client_code ? `<p><strong>Code:</strong> ${client?.client_code}</p>` : ''}
      </div>
    </div>
  `;
}

/**
 * Generate the payment and delivery status section
 */
export function generateStatusSection(
  paymentStatus: 'paid' | 'partial' | 'pending',
  paidAmount: number,
  remainingAmount: number,
  deliveryStatus: 'delivered' | 'partial' | 'pending' | 'awaiting'
): string {
  return `
    <div class="payment-status">
      <div class="status-box">
        <div class="status-title">Statut de paiement</div>
        <div class="status-details">
          <span>Status:</span>
          <span>${paymentStatus === 'paid' 
              ? 'Payé'
              : paymentStatus === 'partial'
              ? 'Partiellement payé'
              : 'En attente de paiement'}</span>
        </div>
        <div class="status-details">
          <span>Montant payé:</span>
          <span>${formatGNF(paidAmount)}</span>
        </div>
        <div class="status-details">
          <span>Reste à payer:</span>
          <span>${formatGNF(remainingAmount)}</span>
        </div>
        
        ${paymentStatus === 'partial' ? `
        <div class="notification payment">
          <div style="display: flex; align-items: center;">
            <span style="color: #856404; margin-right: 8px;">⚠️</span>
            <span>Un paiement partiel a été effectué pour cette facture.</span>
          </div>
        </div>
        ` : ''}
      </div>
      
      <div class="status-box">
        <div class="status-title">Statut de livraison</div>
        <div class="status-details">
          <span>Status:</span>
          <span>${getDeliveryStatusLabel(deliveryStatus)}</span>
        </div>
        
        ${deliveryStatus === 'partial' ? `
        <div class="notification delivery">
          <div style="display: flex; align-items: center;">
            <span style="color: #0c5460; margin-right: 8px;">🚚</span>
            <span>Cette commande a été partiellement livrée.</span>
          </div>
        </div>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Generate the summary table
 */
export function generateSummaryTable(subtotal: number, totalDiscount: number, total: number): string {
  return `
    <div style="display: flex; justify-content: flex-end;">
      <table class="summary-table" style="width: auto;">
        <tr>
          <td><strong>Montant Total</strong></td>
          <td style="text-align: right; width: 120px;">${formatGNF(subtotal)}</td>
        </tr>
        <tr>
          <td><strong>Remise</strong></td>
          <td style="text-align: right;">${formatGNF(totalDiscount)}</td>
        </tr>
        <tr>
          <td><strong>Net à Payer</strong></td>
          <td style="text-align: right;">${formatGNF(total)}</td>
        </tr>
      </table>
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
