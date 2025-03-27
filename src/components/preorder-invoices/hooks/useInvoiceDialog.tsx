
import { useState } from "react";
import { toast } from "sonner";

export function useInvoiceDialog() {
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const handlePrint = async () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Impossible d'ouvrir la fenêtre d'impression");
      return;
    }

    const invoiceElement = document.getElementById('invoice-for-print');
    if (!invoiceElement) {
      toast.error("Erreur lors de la préparation de l'impression");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Précommande ${selectedInvoice?.id.slice(0, 8).toUpperCase()}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; }
            @media print {
              body { background: white; color: black; }
            }
          </style>
        </head>
        <body>
          ${invoiceElement.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return {
    showInvoiceDialog,
    setShowInvoiceDialog,
    selectedInvoice,
    setSelectedInvoice,
    handlePrint
  };
}
