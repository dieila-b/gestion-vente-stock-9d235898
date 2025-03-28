
import { formatGNF } from "@/lib/currency";
import { useRef } from "react";
import { InvoiceShareActions } from "./InvoiceShareActions";
import { 
  InvoiceHeaderSection, 
  InvoiceItemsTable,
  InvoiceTotals,
  InvoiceStatusSection
} from "./invoice-sections";

interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  discount?: number;
  image_url?: string;
}

interface InvoiceTemplateProps {
  invoiceNumber: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  clientAddress?: string;
  clientCode?: string;
  paymentStatus?: 'paid' | 'partial' | 'pending';
  paidAmount?: number;
  remainingAmount?: number;
  deliveryStatus?: 'delivered' | 'partial' | 'pending' | 'awaiting';
  onShare?: boolean;
  shipping_cost?: number;
  supplierNumber?: string;
}

export function InvoiceTemplate({
  invoiceNumber,
  date,
  items,
  subtotal,
  discount,
  total,
  clientName = "Client comptoir",
  clientPhone,
  clientEmail,
  clientAddress = "Madina C/Matam",
  clientCode,
  paymentStatus = 'pending',
  paidAmount = 0,
  remainingAmount = 0,
  deliveryStatus = 'pending',
  onShare = true,
  shipping_cost = 0,
  supplierNumber
}: InvoiceTemplateProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {onShare && (
        <div className="mb-2">
          <InvoiceShareActions
            invoiceNumber={invoiceNumber}
            clientName={clientName}
            clientPhone={clientPhone}
            clientEmail={clientEmail}
            totalAmount={total}
            invoiceRef={invoiceRef}
            formatGNF={formatGNF}
          />
        </div>
      )}
      
      <div 
        ref={invoiceRef} 
        className="bg-white text-black border border-black"
        style={{ width: '100%', pageBreakInside: 'avoid' }}
      >
        {/* Header section */}
        <InvoiceHeaderSection
          invoiceNumber={invoiceNumber}
          date={date}
          clientName={clientName}
          clientEmail={clientEmail}
          clientPhone={clientPhone}
          clientAddress={clientAddress}
          clientCode={clientCode}
          supplierNumber={supplierNumber}
        />
        
        {/* Items table */}
        <InvoiceItemsTable items={items} />
        
        {/* Totals section */}
        <InvoiceTotals
          subtotal={subtotal}
          discount={discount}
          total={total}
          shipping_cost={shipping_cost}
        />
        
        {/* Payment and delivery status */}
        <InvoiceStatusSection
          paymentStatus={paymentStatus}
          paidAmount={paidAmount}
          remainingAmount={remainingAmount}
          deliveryStatus={deliveryStatus}
        />
      </div>
    </div>
  );
}
