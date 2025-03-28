
import { toast } from "sonner";
import { invoiceStyles } from "@/hooks/pos/payment/invoice-template/utils/invoiceStyles";
import { 
  calculateSubtotalBeforeDiscount,
  calculateTotalDiscount
} from "./utils/calculationUtils";

export function useInvoicePrinter() {
  const handlePrint = (selectedInvoice: any) => {
    if (!selectedInvoice) {
      toast.error("Aucune facture à imprimer");
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Impossible d'ouvrir la fenêtre d'impression");
      return;
    }

    const invoiceDate = new Date(selectedInvoice.created_at);
    const formattedDate = `${invoiceDate.getDate().toString().padStart(2, '0')}/${(invoiceDate.getMonth() + 1).toString().padStart(2, '0')}/${invoiceDate.getFullYear()}`;
    
    const invoiceNumber = selectedInvoice.id.slice(0, 8).toUpperCase();
    
    // Calculate subtotal and discount using utility functions
    const subtotalBeforeDiscount = calculateSubtotalBeforeDiscount(selectedInvoice.items);
    const totalDiscount = calculateTotalDiscount(selectedInvoice.items);
    
    // Generate the HTML content using the same styling as the displayed invoice
    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Facture ${invoiceNumber}</title>
          <meta charset="UTF-8">
          <style>
            ${invoiceStyles}
            @media print {
              body { padding: 0; margin: 0; }
              .no-print { display: none !important; }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid black; padding: 8px; }
              .company-logo { background-color: #f0f8ff !important; }
              .client-info { background-color: #f5f5f5 !important; }
              .payment-status, .delivery-status { padding: 15px; }
              .status-notification { 
                background-color: #e6f7e6 !important; 
                border-left: 4px solid #4caf50 !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <!-- Header with logo and company info -->
            <table style="border-collapse: collapse; width: 100%;">
              <tr>
                <td style="width: 50%; border: 1px solid black; padding: 10px; background-color: #f0f8ff;">
                  <img 
                    src="/lovable-uploads/a4c01cc2-c7e7-4877-b12e-00121b9e346b.png" 
                    alt="Company Logo"
                    style="max-height: 80px; display: block; margin: 0 auto;" 
                  />
                </td>
                <td style="width: 50%; border: 1px solid black; padding: 10px; vertical-align: top;">
                  <h3 style="margin-top: 0; margin-bottom: 10px; font-size: 16px;">Information de la société</h3>
                  <p><strong>Nom:</strong> Ets Aicha Business Alphaya</p>
                  <p><strong>Adresse:</strong> Madina-Gare routière Kankan C/Matam</p>
                  <p><strong>Téléphone:</strong> +224 613 98 11 24 / 625 72 76 93</p>
                  <p><strong>Email:</strong> etsaichabusinessalphaya@gmail.com</p>
                </td>
              </tr>
            </table>
            
            <!-- FACTURE Title -->
            <table style="border-collapse: collapse; width: 100%;">
              <tr>
                <td style="border: 1px solid black; padding: 10px; text-align: left; font-weight: bold; font-size: 18px;">
                  FACTURE
                </td>
              </tr>
            </table>
            
            <!-- Invoice Info and Client Info -->
            <table style="border-collapse: collapse; width: 100%;">
              <tr>
                <td style="width: 50%; border: 1px solid black; padding: 10px; vertical-align: top;">
                  <p><strong>DATE:</strong> ${formattedDate}</p>
                  <p><strong>FACTURE N°:</strong> ${invoiceNumber}</p>
                </td>
                <td style="width: 50%; border: 1px solid black; padding: 10px; vertical-align: top; background-color: #f5f5f5;">
                  <h3 style="margin-top: 0; margin-bottom: 10px;">CLIENT:</h3>
                  <p><strong>Nom:</strong> ${selectedInvoice.client?.company_name || selectedInvoice.client?.contact_name || "CLIENT COMPTOIR"}</p>
                  <p><strong>Téléphone:</strong> ${selectedInvoice.client?.phone || ""}</p>
                  <p><strong>Adresse:</strong> ${selectedInvoice.client?.address || ""}</p>
                  <p><strong>Email:</strong> ${selectedInvoice.client?.email || ""}</p>
                  ${selectedInvoice.client?.client_code ? `<p><strong>Code:</strong> ${selectedInvoice.client?.client_code}</p>` : ''}
                </td>
              </tr>
            </table>
            
            <!-- Products Table -->
            <table style="border-collapse: collapse; width: 100%;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="border: 1px solid black; padding: 8px; text-align: left;">Produit</th>
                  <th style="border: 1px solid black; padding: 8px; text-align: right;">Prix unitaire</th>
                  <th style="border: 1px solid black; padding: 8px; text-align: right;">Remise</th>
                  <th style="border: 1px solid black; padding: 8px; text-align: right;">Prix net</th>
                  <th style="border: 1px solid black; padding: 8px; text-align: center;">Qté</th>
                  <th style="border: 1px solid black; padding: 8px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${selectedInvoice.items.map((item, index) => {
                  const originalPrice = item.price || 0;
                  const discount = item.discount || 0;
                  const netPrice = originalPrice - discount;
                  const totalPrice = netPrice * item.quantity;
                  
                  return `
                    <tr>
                      <td style="border: 1px solid black; padding: 8px; text-align: left;">${item.product?.name || 'Produit inconnu'}</td>
                      <td style="border: 1px solid black; padding: 8px; text-align: right;">${originalPrice.toLocaleString('fr-GN')} FG</td>
                      <td style="border: 1px solid black; padding: 8px; text-align: right;">${discount > 0 ? `${discount.toLocaleString('fr-GN')} FG` : '-'}</td>
                      <td style="border: 1px solid black; padding: 8px; text-align: right;">${netPrice.toLocaleString('fr-GN')} FG</td>
                      <td style="border: 1px solid black; padding: 8px; text-align: center;">${item.quantity}</td>
                      <td style="border: 1px solid black; padding: 8px; text-align: right;">${totalPrice.toLocaleString('fr-GN')} FG</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
            
            <!-- Summary Table -->
            <table style="border-collapse: collapse; width: 100%;">
              <tr>
                <td style="width: 70%; border: 1px solid black; padding: 0;"></td>
                <td style="width: 30%; border: 1px solid black; padding: 0;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="border: 1px solid black; padding: 8px;"><strong>Montant Total</strong></td>
                      <td style="border: 1px solid black; padding: 8px; text-align: right;">${subtotalBeforeDiscount.toLocaleString('fr-GN')} FG</td>
                    </tr>
                    <tr>
                      <td style="border: 1px solid black; padding: 8px;"><strong>Remise</strong></td>
                      <td style="border: 1px solid black; padding: 8px; text-align: right;">${totalDiscount.toLocaleString('fr-GN')} FG</td>
                    </tr>
                    <tr>
                      <td style="border: 1px solid black; padding: 8px;"><strong>Net A Payer</strong></td>
                      <td style="border: 1px solid black; padding: 8px; text-align: right;"><strong>${selectedInvoice.final_total.toLocaleString('fr-GN')} FG</strong></td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            
            <!-- Amount in Words -->
            <table style="border-collapse: collapse; width: 100%;">
              <tr>
                <td style="border: 1px solid black; padding: 10px; font-style: italic;">
                  <p style="margin: 0;">
                    <strong>Arrêtée la présente facture à la somme de:</strong> ${
                      new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'GNF', minimumFractionDigits: 0, maximumFractionDigits: 0 })
                      .format(selectedInvoice.final_total)
                      .replace('GNF', '')
                      .trim()
                    } Franc Guinéen
                  </p>
                </td>
              </tr>
            </table>
            
            <!-- Status Section -->
            <table style="border-collapse: collapse; width: 100%;">
              <tr>
                <td style="width: 50%; border: 1px solid black; padding: 10px; vertical-align: top;">
                  <h3 style="margin-top: 0; margin-bottom: 10px;">Statut de paiement</h3>
                  <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                    <tr>
                      <td style="padding: 4px 0; border: none;"><strong>Statut:</strong></td>
                      <td style="padding: 4px 0; border: none; text-align: right; color: ${selectedInvoice.payment_status === 'paid' ? 'green' : 'inherit'}">
                        ${selectedInvoice.payment_status === 'paid' 
                        ? 'Payé'
                        : selectedInvoice.payment_status === 'partial'
                        ? 'Partiellement payé'
                        : 'En attente de paiement'}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0; border: none;"><strong>Montant payé:</strong></td>
                      <td style="padding: 4px 0; border: none; text-align: right;">${(selectedInvoice.paid_amount || 0).toLocaleString('fr-GN')} FG</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0; border: none;"><strong>Montant restant:</strong></td>
                      <td style="padding: 4px 0; border: none; text-align: right;">${(selectedInvoice.remaining_amount || 0).toLocaleString('fr-GN')} FG</td>
                    </tr>
                  </table>
                  
                  <h3 style="margin-top: 15px; margin-bottom: 10px;">Statut de livraison</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 4px 0; border: none;"><strong>Statut:</strong></td>
                      <td style="padding: 4px 0; border: none; text-align: right; color: ${selectedInvoice.delivery_status === 'delivered' ? 'green' : 'inherit'}">
                        ${selectedInvoice.delivery_status === 'delivered' 
                        ? 'Entièrement livré'
                        : selectedInvoice.delivery_status === 'partial'
                        ? 'Partiellement livré'
                        : selectedInvoice.delivery_status === 'awaiting'
                        ? 'En attente de livraison'
                        : 'Non livré'}
                      </td>
                    </tr>
                  </table>
                </td>
                <td style="width: 50%; border: 1px solid black; padding: 10px; vertical-align: top;">
                  ${selectedInvoice.payment_status === 'paid' ? `
                  <div style="margin-top: 10px; padding: 10px; background-color: #e6f7e6; border-left: 4px solid #4caf50; display: flex; align-items: center;">
                    <span style="margin-right: 10px; color: #4caf50;">✓</span>
                    <span>Cette facture a été intégralement payée.</span>
                  </div>
                  ` : ''}
                  
                  ${selectedInvoice.delivery_status === 'delivered' ? `
                  <div style="margin-top: 10px; padding: 10px; background-color: #e6f7e6; border-left: 4px solid #4caf50; display: flex; align-items: center;">
                    <span style="margin-right: 10px; color: #4caf50;">✓</span>
                    <span>Cette commande a été entièrement livrée.</span>
                  </div>
                  ` : ''}
                </td>
              </tr>
            </table>
          </div>
          
          <script>
            // Focus and print after a small delay to ensure content is loaded
            window.onload = function() {
              window.focus();
              setTimeout(() => {
                window.print();
              }, 1000);
            }
          </script>
        </body>
      </html>
    `;

    // Write the generated HTML to the new window and close the document
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  };

  return { handlePrint };
}
