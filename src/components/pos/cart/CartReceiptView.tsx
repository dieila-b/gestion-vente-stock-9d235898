
import { CartItem as CartItemType } from "@/types/pos";
import { Receipt as ReceiptComponent } from "../Receipt";
import { DynamicInvoice } from "@/components/invoices/dynamic/DynamicInvoice";
import { Client } from "@/types/client";

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
      <DynamicInvoice
        invoiceNumber={invoiceNumber}
        items={items}
        subtotal={subtotal}
        discount={totalDiscount}
        total={total}
        date={currentDate}
        clientName={selectedClient?.company_name}
        clientEmail={selectedClient?.email}
      />
    );
  }

  if (showReceipt) {
    return (
      <ReceiptComponent
        items={items}
        subtotal={subtotal}
        discount={totalDiscount}
        total={total}
        onPrint={onPrint}
        selectedClient={selectedClient}
      />
    );
  }

  return null;
}
