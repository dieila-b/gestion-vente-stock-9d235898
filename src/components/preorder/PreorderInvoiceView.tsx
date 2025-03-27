
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DynamicInvoice } from "@/components/invoices/dynamic/DynamicInvoice";
import { useRef } from "react";
import { InvoiceShareActions } from "@/components/invoices/InvoiceShareActions";
import { formatGNF } from "@/lib/currency";

interface PreorderInvoiceViewProps {
  showInvoiceDialog: boolean;
  handleCloseInvoice: () => void;
  currentPreorder: any;
  handlePrintInvoice: () => void;
}

export function PreorderInvoiceView({
  showInvoiceDialog,
  handleCloseInvoice,
  currentPreorder,
  handlePrintInvoice
}: PreorderInvoiceViewProps) {
  if (!currentPreorder) return null;
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Map items to include images
  const itemsWithImages = currentPreorder.items.map((item: any) => ({
    ...item,
    image: item.product?.image || null
  }));

  return (
    <Dialog open={showInvoiceDialog} onOpenChange={handleCloseInvoice}>
      <DialogContent className="max-w-4xl flex flex-col max-h-[90vh]">
        {/* Share actions at the top with sticky positioning */}
        <div className="sticky top-0 z-10 bg-white pb-4 pt-2 border-b">
          <InvoiceShareActions
            invoiceNumber={`PR-${currentPreorder.id.substring(0, 8).toUpperCase()}`}
            clientName={currentPreorder.client?.company_name || currentPreorder.client?.contact_name || "Client"}
            clientPhone={currentPreorder.client?.phone}
            clientEmail={currentPreorder.client?.email}
            totalAmount={currentPreorder.total_amount}
            invoiceRef={invoiceRef}
            onPrint={handlePrintInvoice}
            formatGNF={formatGNF}
          />
        </div>
        
        {/* Scrollable content area */}
        <div className="overflow-y-auto">
          <div id="preorder-invoice" ref={invoiceRef}>
            <DynamicInvoice
              invoiceNumber={`PR-${currentPreorder.id.substring(0, 8).toUpperCase()}`}
              items={itemsWithImages}
              subtotal={currentPreorder.total_amount}
              discount={currentPreorder.items.reduce((acc: number, item: any) => acc + ((item.discount || 0) * item.quantity), 0)}
              total={currentPreorder.total_amount}
              date={new Date().toLocaleDateString()}
              clientName={currentPreorder.client?.company_name || currentPreorder.client?.contact_name} 
              clientContactName={currentPreorder.client?.contact_name}
              clientPhone={currentPreorder.client?.phone}
              clientEmail={currentPreorder.client?.email}
              clientAddress={currentPreorder.client?.address}
              clientCode={currentPreorder.client?.client_code}
              companyInfo={{
                name: "DarkStock Manager",
                address: "Conakry, Guinée",
                email: "contact@darkstock.com",
                phone: "+224 123 456 789"
              }}
              paymentStatus={currentPreorder.payment_status}
              paidAmount={currentPreorder.paid_amount}
              remainingAmount={currentPreorder.remaining_amount}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
