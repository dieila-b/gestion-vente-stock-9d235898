
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DynamicInvoice } from "@/components/invoices/dynamic/DynamicInvoice";
import { formatGNF } from "@/lib/currency";
import { useRef } from "react";
import { InvoiceShareActions } from "../invoices/InvoiceShareActions";

interface SalesInvoiceDialogProps {
  showInvoiceDialog: boolean;
  setShowInvoiceDialog: (value: boolean) => void;
  selectedInvoice: any;
  handlePrint: () => void;
  formatInvoiceItems: (invoice: any) => any[];
}

export function SalesInvoiceDialog({
  showInvoiceDialog,
  setShowInvoiceDialog,
  selectedInvoice,
  handlePrint,
  formatInvoiceItems
}: SalesInvoiceDialogProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  return (
    <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
      <DialogContent className="max-w-4xl flex flex-col max-h-[90vh]">
        <DialogTitle className="mb-4">Facture</DialogTitle>
        
        {/* Share actions at the top, with sticky positioning */}
        {selectedInvoice && (
          <div className="sticky top-0 z-10 bg-white pb-4 pt-2 border-b">
            <InvoiceShareActions
              invoiceNumber={selectedInvoice.id.slice(0, 8).toUpperCase()}
              clientName={selectedInvoice.client?.company_name || selectedInvoice.client?.contact_name}
              clientPhone={selectedInvoice.client?.phone || selectedInvoice.client?.mobile_1 || selectedInvoice.client?.mobile_2 || selectedInvoice.client?.whatsapp}
              clientEmail={selectedInvoice.client?.email}
              totalAmount={selectedInvoice.final_total}
              invoiceRef={invoiceRef}
              onPrint={handlePrint}
              formatGNF={formatGNF}
            />
          </div>
        )}
        
        {/* Scrollable content area */}
        <div className="overflow-y-auto">
          <div ref={invoiceRef}>
            {selectedInvoice && (
              <DynamicInvoice
                invoiceNumber={selectedInvoice.id.slice(0, 8).toUpperCase()}
                items={formatInvoiceItems(selectedInvoice)}
                subtotal={calculateSubtotal(formatInvoiceItems(selectedInvoice))}
                discount={calculateTotalDiscount(formatInvoiceItems(selectedInvoice))}
                total={selectedInvoice.final_total}
                date={new Date(selectedInvoice.created_at).toLocaleDateString()}
                clientName={selectedInvoice.client?.company_name || selectedInvoice.client?.contact_name}
                clientContactName={selectedInvoice.client?.contact_name}
                clientPhone={selectedInvoice.client?.phone || selectedInvoice.client?.mobile_1 || selectedInvoice.client?.mobile_2 || selectedInvoice.client?.whatsapp}
                clientEmail={selectedInvoice.client?.email}
                clientAddress={selectedInvoice.client?.address}
                clientCode={selectedInvoice.client?.client_code}
                paymentStatus={selectedInvoice.payment_status}
                paidAmount={selectedInvoice.paid_amount}
                remainingAmount={selectedInvoice.remaining_amount}
                deliveryStatus={selectedInvoice.delivery_status}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper functions to calculate totals
function calculateSubtotal(items: any[]) {
  return items.reduce((sum, item) => sum + item.total, 0);
}

function calculateTotalDiscount(items: any[]) {
  return items.reduce((sum, item) => sum + (item.totalDiscount || 0), 0);
}
