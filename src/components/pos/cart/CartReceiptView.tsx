
import { CartItem as CartItemType } from "@/types/pos";
import { Client } from "@/types/client";
import { InvoiceTemplate } from "@/components/invoices/InvoiceTemplate";

interface CartReceiptViewProps {
  showReceipt: boolean;
  showInvoice: boolean;
  items: CartItemType[];
  subtotal: number;
  totalDiscount: number;
  total: number;
  onPrint: () => void;
  selectedClient: Client | null;
  invoiceNumber: string;
  currentDate: string;
}

export function CartReceiptView({
  showReceipt,
  showInvoice,
  items,
  subtotal,
  totalDiscount,
  total,
  onPrint,
  selectedClient,
  invoiceNumber,
  currentDate
}: CartReceiptViewProps) {
  if (showInvoice) {
    return (
      <InvoiceTemplate
        invoiceNumber={invoiceNumber}
        date={currentDate}
        items={items}
        subtotal={subtotal}
        discount={totalDiscount}
        total={total}
        clientName={selectedClient?.company_name || selectedClient?.contact_name}
        clientEmail={selectedClient?.email}
        clientPhone={selectedClient?.phone}
        clientAddress={selectedClient?.address}
        clientCode={selectedClient?.client_code}
        paymentStatus="paid"
        paidAmount={total}
        remainingAmount={0}
        deliveryStatus="delivered"
        onShare={true}
      />
    );
  }

  if (showReceipt) {
    return (
      <InvoiceTemplate
        invoiceNumber={invoiceNumber}
        date={currentDate}
        items={items}
        subtotal={subtotal}
        discount={totalDiscount}
        total={total}
        clientName={selectedClient?.company_name || selectedClient?.contact_name}
        clientEmail={selectedClient?.email}
        clientPhone={selectedClient?.phone}
        clientAddress={selectedClient?.address}
        clientCode={selectedClient?.client_code}
        paymentStatus="paid"
        paidAmount={total}
        remainingAmount={0}
        deliveryStatus="delivered"
        onShare={true}
      />
    );
  }

  return null;
}
