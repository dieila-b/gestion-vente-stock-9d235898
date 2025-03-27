
import { Client } from "@/types/client";

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
