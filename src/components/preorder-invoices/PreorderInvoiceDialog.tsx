
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DynamicInvoice } from "@/components/invoices/dynamic/DynamicInvoice";
import { formatGNF } from "@/lib/currency";
import { useRef } from "react";
import { InvoiceShareActions } from "../invoices/InvoiceShareActions";

interface PreorderInvoiceDialogProps {
  showInvoiceDialog: boolean;
  setShowInvoiceDialog: (value: boolean) => void;
  selectedInvoice: any;
  handlePrint: () => void;
}

export function PreorderInvoiceDialog({
  showInvoiceDialog,
  setShowInvoiceDialog,
  selectedInvoice,
  handlePrint
}: PreorderInvoiceDialogProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Helper function to format invoice items for the DynamicInvoice component
  const formatInvoiceItems = (invoice: any) => {
    return invoice.items.map((item: any) => ({
      id: item.product_id,
      name: item.product?.name || 'Produit inconnu',
      quantity: item.quantity,
      price: item.unit_price,
      discount: item.discount || 0,
      image: item.product?.image,
    }));
  };

  // Helper function to get client phone with fallbacks
  const getClientPhone = (client: any) => {
    return client?.phone || client?.mobile_1 || client?.mobile_2 || client?.whatsapp;
  };

  return (
    <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
      <DialogContent className="max-w-4xl flex flex-col max-h-[90vh]">
        <DialogTitle className="mb-4">Facture de Précommande</DialogTitle>
        
        {/* Share actions at the top with sticky positioning */}
        {selectedInvoice && (
          <div className="sticky top-0 z-10 bg-white pb-4 pt-2 border-b">
            <InvoiceShareActions
              invoiceNumber={selectedInvoice.id.slice(0, 8).toUpperCase()}
              clientName={selectedInvoice.client?.company_name || "Client particulier"}
              clientPhone={getClientPhone(selectedInvoice.client)}
              clientEmail={selectedInvoice.client?.email}
              totalAmount={selectedInvoice.total_amount}
              invoiceRef={invoiceRef}
              onPrint={handlePrint}
              formatGNF={formatGNF}
            />
          </div>
        )}
        
        {/* Scrollable content area */}
        <div className="overflow-y-auto">
          <div ref={invoiceRef} id="invoice-for-print">
            {selectedInvoice && (
              <DynamicInvoice
                invoiceNumber={selectedInvoice.id.slice(0, 8).toUpperCase()}
                items={formatInvoiceItems(selectedInvoice)}
                subtotal={selectedInvoice.total_amount}
                discount={0}
                total={selectedInvoice.total_amount}
                date={new Date(selectedInvoice.created_at).toLocaleDateString()}
                clientName={selectedInvoice.client?.company_name || "Client particulier"}
                clientEmail={selectedInvoice.client?.email}
                clientPhone={getClientPhone(selectedInvoice.client)}
                clientAddress={selectedInvoice.client?.address}
                clientContactName={selectedInvoice.client?.contact_name}
                clientCode={selectedInvoice.client?.client_code}
                paymentStatus={selectedInvoice.status}
                paidAmount={selectedInvoice.paid_amount}
                remainingAmount={selectedInvoice.remaining_amount}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
