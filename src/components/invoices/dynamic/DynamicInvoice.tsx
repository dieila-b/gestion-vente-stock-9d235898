
import React from 'react';
import { formatGNF } from '@/lib/currency';
import { InvoiceHeader } from './InvoiceHeader';
import { InvoiceItems } from './InvoiceItems';
import { InvoiceSummary } from './InvoiceSummary';
import { PaymentInfo } from './PaymentInfo';
import { PaymentStatus } from './PaymentStatus';
import { InvoiceActions } from './InvoiceActions';

interface Item {
  id: string;
  name: string;
  quantity: number;
  price: number;
  discount?: number;
  image?: string | null;
  deliveredQuantity?: number;
}

interface CompanyInfo {
  name?: string;
  address?: string;
  email?: string;
  phone?: string;
}

export interface DynamicInvoiceProps {
  invoiceNumber: string;
  items: Item[];
  subtotal: number;
  discount: number;
  total: number;
  date: string;
  clientName: string;
  clientEmail?: string;
  clientCode?: string;
  clientPhone?: string;
  clientAddress?: string;
  clientContactName?: string;  // Added contact name
  paymentStatus?: 'paid' | 'partial' | 'pending';
  paidAmount?: number;
  remainingAmount?: number;
  deliveryStatus?: 'delivered' | 'partial' | 'pending' | 'awaiting';
  shipping_cost?: number;
  companyInfo?: CompanyInfo;
  supplierNumber?: string;
  onApprove?: () => void;
  onSendEmail?: () => void;
  onDownload?: () => void;
  onPrint?: () => void;
  onAddPayment?: () => void;
  onWhatsApp?: () => void;
  actions?: boolean;
  code?: string;
}

export const DynamicInvoice: React.FC<DynamicInvoiceProps> = ({
  invoiceNumber,
  items,
  subtotal,
  discount,
  total,
  date,
  clientName,
  clientEmail,
  clientCode,
  clientPhone,
  clientAddress,
  clientContactName,  // Added contact name
  paymentStatus = 'pending',
  paidAmount = 0,
  remainingAmount = 0,
  deliveryStatus = 'pending',
  shipping_cost = 0,
  companyInfo,
  supplierNumber,
  onApprove,
  onSendEmail,
  onDownload,
  onPrint,
  onAddPayment,
  onWhatsApp,
  actions = false,
  code,
}) => {
  // Only show delivery information when delivery is partial
  const showDeliveryInfo = deliveryStatus === 'partial';
  
  return (
    <div className="bg-white text-black border border-black">
      <InvoiceHeader
        invoiceNumber={invoiceNumber}
        date={date}
        clientName={clientName}
        clientEmail={clientEmail}
        clientCode={clientCode}
        clientPhone={clientPhone}
        clientAddress={clientAddress}
        clientContactName={clientContactName}  // Added contact name
        code={code}
        companyInfo={companyInfo}
        supplierNumber={supplierNumber}
      />
      <InvoiceItems items={items} showDeliveryInfo={showDeliveryInfo} />
      <InvoiceSummary
        subtotal={subtotal}
        discount={discount}
        total={total}
        shipping_cost={shipping_cost}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-black">
        <div className="p-6 border-r border-black">
          <PaymentInfo
            paymentStatus={paymentStatus}
            paidAmount={paidAmount}
            remainingAmount={remainingAmount}
            deliveryStatus={deliveryStatus}
          />
        </div>
        <div className="p-6">
          <PaymentStatus
            status={paymentStatus}
            deliveryStatus={deliveryStatus}
          />
        </div>
      </div>
      {actions && (
        <InvoiceActions
          onSendEmail={onSendEmail}
          onDownload={onDownload}
          onPrint={onPrint}
          onAddPayment={onAddPayment}
          onWhatsApp={onWhatsApp}
        />
      )}
    </div>
  );
};
