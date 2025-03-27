
import { formatGNF } from "@/lib/currency";
import { CartItem } from "@/types/pos";
import { Client } from "@/types/client";
import { toast } from "sonner";
import { useInvoiceTemplate } from "./invoice-template/useInvoiceTemplate";
import { usePrintWindow } from "./invoice-template/usePrintWindow";

export function useInvoicePrinting() {
  const { generateInvoiceHTML } = useInvoiceTemplate();
  const { openPrintWindow } = usePrintWindow();

  // Function to open invoice in new window
  const openInvoiceInNewWindow = (
    orderId: string, 
    items: CartItem[], 
    client: Client | null,
    paymentStatus: 'paid' | 'partial' | 'pending' = 'pending',
    paidAmount: number = 0,
    remainingAmount: number = 0,
    deliveryStatus: 'delivered' | 'partial' | 'pending' | 'awaiting' = 'pending',
    deliveredItems?: Record<string, { delivered: boolean, quantity: number }>
  ) => {
    try {
      const invoiceNumber = orderId.slice(0, 8).toUpperCase();
      const currentDate = new Date().toLocaleDateString('fr-FR');
      
      const total = items.reduce((sum, item) => 
        sum + (item.price * item.quantity) - ((item.discount || 0) * item.quantity), 0);
      
      // Generate the HTML content for the invoice using our template
      const invoiceHtml = generateInvoiceHTML(
        invoiceNumber, 
        currentDate, 
        items, 
        total, 
        client,
        paymentStatus,
        paidAmount,
        remainingAmount,
        deliveryStatus,
        deliveredItems
      );
      
      // Open the print window with the generated content
      openPrintWindow(invoiceHtml);
    } catch (error) {
      console.error("Error opening invoice:", error);
      toast.error("Erreur lors de l'ouverture de la facture");
    }
  };

  return { openInvoiceInNewWindow };
}
