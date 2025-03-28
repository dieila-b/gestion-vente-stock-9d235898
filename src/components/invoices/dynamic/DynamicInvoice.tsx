
import { InvoiceTemplate } from "../InvoiceTemplate";

interface DynamicInvoiceProps {
  invoiceNumber: string;
  items: any[];
  subtotal: number;
  discount: number;
  total: number;
  date: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  clientContactName?: string;
  clientCode?: string;
  onDownload?: () => void;
  paymentStatus?: 'paid' | 'partial' | 'pending';
  paidAmount?: number;
  remainingAmount?: number;
  deliveryStatus?: 'delivered' | 'partial' | 'pending' | 'awaiting';
  onAddPayment?: () => void;
  companyInfo?: {
    name: string;
    address: string;
    email: string;
    phone: string;
  };
}

export function DynamicInvoice({
  invoiceNumber,
  items,
  subtotal,
  discount,
  total,
  date,
  clientName,
  clientEmail,
  clientPhone,
  clientAddress,
  clientContactName,
  clientCode,
  paymentStatus = 'pending',
  paidAmount = 0,
  remainingAmount = total,
  deliveryStatus = 'pending',
}: DynamicInvoiceProps) {
  // Use the display name if present, otherwise use company name
  const displayName = clientContactName || clientName;
  
  return (
    <InvoiceTemplate
      invoiceNumber={invoiceNumber}
      date={date}
      items={items}
      subtotal={subtotal}
      discount={discount}
      total={total}
      clientName={displayName}
      clientEmail={clientEmail}
      clientPhone={clientPhone}
      clientAddress={clientAddress}
      clientCode={clientCode}
      paymentStatus={paymentStatus}
      paidAmount={paidAmount}
      remainingAmount={remainingAmount}
      deliveryStatus={deliveryStatus}
    />
  );
}
