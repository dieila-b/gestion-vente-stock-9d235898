
import { useRef } from 'react';
import { PurchaseOrder, PurchaseOrderItem } from '@/types/purchase-order';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

export function usePurchasePrint() {
  const printRef = useRef<HTMLDivElement>(null);

  const formatGNF = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const printPurchaseOrder = (order: PurchaseOrder) => {
    if (!order) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Impossible d'ouvrir la fenêtre d'impression");
      return;
    }

    console.log("Order to print:", order);
    console.log("Items to print:", order.items);

    // Check if items exist and fallback to empty array if not
    const orderItems = order.items || [];
    console.log("Using items:", orderItems.length);

    // Génération du contenu des articles
    const itemsContent = orderItems && orderItems.length > 0 
      ? orderItems.map((item: PurchaseOrderItem, index: number) => {
          console.log("Processing item:", item);
          const productName = item.product?.name || item.designation || 'Produit inconnu';
          const productRef = item.product?.reference || `Prod-${index + 1}`;
          return `
            <tr>
              <td>${productRef}</td>
              <td>${productName}</td>
              <td style="text-align: center;">${item.quantity}</td>
              <td style="text-align: right;">${formatGNF(item.unit_price)}</td>
              <td style="text-align: right;">${formatGNF(item.total_price)}</td>
            </tr>
          `;
        }).join('') 
      : '<tr><td colspan="5">Aucun produit</td></tr>';

    // Create print content for the purchase order
    const printContent = `
      <html>
        <head>
          <title>Bon de commande ${order.order_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .company-info, .supplier-info { width: 48%; }
            .order-details { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total-section { display: flex; justify-content: flex-end; }
            .total-table { width: 300px; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
            @media print {
              body { margin: 0; padding: 10px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-info">
              <h2>Société</h2>
              <p>Démo</p>
              <p>Adresse: Abidjan</p>
              <p>Tel: +225 05 55 95 45 33</p>
            </div>
            <div class="supplier-info">
              <h2>Fournisseur</h2>
              <p>${order.supplier?.name || 'Non spécifié'}</p>
              <p>Contact: ${order.supplier?.contact || 'Non spécifié'}</p>
              <p>Tel: ${order.supplier?.phone || 'Non spécifié'}</p>
              <p>Email: ${order.supplier?.email || 'Non spécifié'}</p>
            </div>
          </div>
          
          <div class="order-details">
            <h1>Bon de commande N° ${order.order_number}</h1>
            <p>Date: ${new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
            <p>Statut: ${order.status === 'pending' ? 'En attente' : order.status === 'approved' ? 'Approuvé' : 'Livré'}</p>
            <p>Statut de paiement: ${
              order.payment_status === 'pending' ? 'En attente' : 
              order.payment_status === 'partial' ? 'Partiellement payé' : 'Payé'
            }</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Référence</th>
                <th>Produit</th>
                <th style="text-align: center;">Quantité</th>
                <th style="text-align: right;">Prix unitaire</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsContent}
            </tbody>
          </table>
          
          <div class="total-section">
            <table class="total-table">
              <tr>
                <td>Sous-total:</td>
                <td>${formatGNF(order.subtotal || 0)}</td>
              </tr>
              <tr>
                <td>TVA (${order.tax_rate || 0}%):</td>
                <td>${formatGNF(order.tax_amount || 0)}</td>
              </tr>
              <tr>
                <td>Frais de livraison:</td>
                <td>${formatGNF(order.shipping_cost || 0)}</td>
              </tr>
              <tr>
                <td>Logistique:</td>
                <td>${formatGNF(order.logistics_cost || 0)}</td>
              </tr>
              <tr>
                <td>Transit:</td>
                <td>${formatGNF(order.transit_cost || 0)}</td>
              </tr>
              <tr>
                <td>Remise:</td>
                <td>${formatGNF(order.discount || 0)}</td>
              </tr>
              <tr>
                <td><strong>Total TTC:</strong></td>
                <td><strong>${formatGNF(order.total_ttc || 0)}</strong></td>
              </tr>
            </table>
          </div>
          
          <div class="footer">
            <p>Notes: ${order.notes || 'Aucune note'}</p>
            <p>Bon de commande généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
          </div>
          
          <script>
            // Log the items for debugging
            console.log("Printing items:", ${JSON.stringify(orderItems.map(item => ({
              id: item.id,
              name: item.product?.name || item.designation || 'Produit inconnu',
              quantity: item.quantity,
              unit_price: item.unit_price
            })))});
            
            window.onload = function() {
              // Focus and print after a small delay to ensure content is loaded
              window.focus();
              setTimeout(() => {
                window.print();
              }, 1000);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const downloadPdf = async (order: PurchaseOrder) => {
    if (!printRef.current || !order) return;

    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(pdfHeight, pdf.internal.pageSize.getHeight()));
      pdf.save(`bon_commande_${order.order_number}.pdf`);
      
      toast.success("Bon de commande téléchargé en PDF");
    } catch (error) {
      console.error("Erreur lors du téléchargement du PDF:", error);
      toast.error("Échec du téléchargement du PDF");
    }
  };

  return {
    printRef,
    formatGNF,
    printPurchaseOrder,
    downloadPdf
  };
}
