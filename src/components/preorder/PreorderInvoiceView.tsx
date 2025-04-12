
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DynamicInvoice } from "@/components/invoices/dynamic/DynamicInvoice";
import { useRef } from "react";
import { InvoiceShareActions } from "@/components/invoices/InvoiceShareActions";
import { formatGNF } from "@/lib/currency";
import { CartItem } from "@/types/pos";
import { Client } from "@/types/client";

interface PreorderInvoiceViewProps {
  cart: CartItem[];
  client: Client | null;
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRequestPayment: () => void;
  isLoading: boolean;
  isInvoiceOpen: boolean;
  setIsInvoiceOpen: (open: boolean) => void;
  calculateTotal: () => number;
  calculateSubtotal: () => number;
  calculateTotalDiscount: () => number;
  onUpdateDiscount: (id: string, discount: number) => void;
  notes: string;
  onUpdateNotes: (notes: string) => void;
  
  // Legacy props for backward compatibility
  showInvoiceDialog?: boolean;
  handleCloseInvoice?: () => void;
  currentPreorder?: any;
  handlePrintInvoice?: () => void;
}

export function PreorderInvoiceView({
  cart,
  client,
  onRemoveItem,
  onUpdateQuantity,
  onRequestPayment,
  isLoading,
  isInvoiceOpen,
  setIsInvoiceOpen,
  calculateTotal,
  calculateSubtotal,
  calculateTotalDiscount,
  onUpdateDiscount,
  notes,
  onUpdateNotes,
  
  // Legacy props for backward compatibility
  showInvoiceDialog,
  handleCloseInvoice,
  currentPreorder,
  handlePrintInvoice
}: PreorderInvoiceViewProps) {
  // Handle both new implementation and legacy implementation
  if (currentPreorder && showInvoiceDialog !== undefined) {
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

  // New implementation
  // Note: This should be implemented based on the actual requirements
  return (
    <div>
      {/* Implement the new version of preorder invoice view here */}
      <p>New preorder invoice view to be implemented</p>
    </div>
  );
}
