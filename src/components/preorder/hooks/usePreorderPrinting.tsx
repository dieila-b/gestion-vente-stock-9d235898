
import { toast } from "sonner";
import { invoiceStyles } from "@/hooks/pos/payment/invoice-template/utils/invoiceStyles";

export function usePreorderPrinting() {
  const handlePrintInvoice = async (isReceipt: boolean = false) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Impossible d'ouvrir la fenêtre d'impression");
      return;
    }

    const invoiceElement = document.getElementById('preorder-invoice');
    if (!invoiceElement) {
      toast.error("Erreur lors de la préparation de l'impression");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${isReceipt ? 'Reçu' : 'Précommande'}</title>
          <style>
            ${invoiceStyles}
            @media print {
              body { padding: 0; margin: 0; }
              .no-print { display: none !important; }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid black; padding: 8px; }
              .company-logo { background-color: #f0f8ff !important; }
              .client-info { background-color: #f5f5f5 !important; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            ${invoiceElement.innerHTML}
          </div>
          <script>
            // Focus on the window and delay printing to ensure all content is loaded
            window.onload = function() {
              window.focus();
              setTimeout(function() {
                window.print();
              }, 1000);
            }
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return {
    handlePrintInvoice
  };
}
