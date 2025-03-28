
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { DynamicInvoice } from "@/components/invoices/dynamic/DynamicInvoice";
import { InvoiceShareActions } from "@/components/invoices/InvoiceShareActions";
import { formatGNF } from "@/lib/currency";

interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  discount?: number;
}

interface CartItemInfo {
  id: string;
  name: string;
  quantity: number;
}

interface InvoiceDisplayProps {
  invoiceNumber: string;
  items: CartItemInfo[];
  totalAmount: number;
  amount: number;
  client?: any;
  onClose: () => void;
  paymentStatus?: 'paid' | 'partial' | 'pending';
  deliveryStatus?: 'delivered' | 'partial' | 'pending' | 'awaiting';
  paidAmount?: number;
  remainingAmount?: number;
}

export function InvoiceDisplay({
  invoiceNumber,
  items,
  totalAmount,
  amount,
  client,
  onClose,
  paymentStatus = 'pending',
  deliveryStatus = 'pending',
  paidAmount = 0,
  remainingAmount = 0
}: InvoiceDisplayProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Convert CartItemInfo to InvoiceItem with price
  const invoiceItems: InvoiceItem[] = items.map(item => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    price: totalAmount / items.reduce((acc, item) => acc + item.quantity, 1), // Simple approximation
    discount: 0
  }));

  return (
    <div className="space-y-4">
      <div ref={invoiceRef}>
        <DynamicInvoice
          invoiceNumber={invoiceNumber}
          items={invoiceItems}
          subtotal={totalAmount}
          discount={0}
          total={totalAmount}
          date={new Date().toLocaleDateString()}
          clientName={client?.company_name || "Client comptoir"}
          clientEmail={client?.email}
          paymentStatus={paymentStatus}
          paidAmount={paidAmount}
          remainingAmount={remainingAmount}
          deliveryStatus={deliveryStatus}
          onShare={true}
        />
      </div>
      
      <InvoiceShareActions
        invoiceNumber={invoiceNumber}
        clientName={client?.company_name || "Client comptoir"}
        clientPhone={client?.phone}
        clientEmail={client?.email}
        totalAmount={totalAmount}
        invoiceRef={invoiceRef}
        formatGNF={formatGNF}
      />
      
      <div className="flex justify-end">
        <Button onClick={onClose}>
          Fermer
        </Button>
      </div>
    </div>
  );
}
