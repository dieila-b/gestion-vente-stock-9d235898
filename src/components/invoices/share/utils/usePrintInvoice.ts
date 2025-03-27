
import { RefObject } from 'react';
import { toast } from 'sonner';
import { invoiceStyles } from '@/hooks/pos/payment/invoice-template/utils/invoiceStyles';

export function usePrintInvoice() {
  // Print the invoice
  const handlePrint = (invoiceRef: RefObject<HTMLDivElement>, invoiceNumber: string, onPrint?: () => void, isReceipt: boolean = false) => {
    if (onPrint) {
      onPrint();
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Impossible d'ouvrir la fenêtre d'impression");
      return;
    }

    if (invoiceRef.current) {
      const invoiceHtml = invoiceRef.current.outerHTML;
      printWindow.document.write(`
        <html>
          <head>
            <title>${isReceipt ? 'Reçu' : 'Facture'} ${invoiceNumber}</title>
            <style>
              ${invoiceStyles}
              @media print {
                body { 
                  padding: 0; 
                  margin: 0; 
                }
                button, .no-print { 
                  display: none !important; 
                }
                .invoice-container { 
                  border: 1px solid black;
                  width: 100%;
                  margin: 0;
                  padding: 0;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                }
                th, td {
                  border: 1px solid black;
                  padding: 8px;
                }
                .bg-gray-100 {
                  background-color: #f3f4f6 !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                .bg-green-50 {
                  background-color: #f0fdf4 !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                .border-green-500 {
                  border-color: #22c55e !important;
                }
              }
            </style>
          </head>
          <body>
            ${invoiceHtml}
            <script>
              // Automatically focus and print
              window.onload = function() {
                window.focus();
                setTimeout(() => {
                  window.print();
                }, 1000);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return { handlePrint };
}
