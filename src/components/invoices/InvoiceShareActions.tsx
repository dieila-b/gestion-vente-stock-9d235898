
import React from 'react';
import { PrintButton } from './share/components/PrintButton';
import { EmailButton } from './share/components/EmailButton';
import { WhatsAppButton } from './share/components/WhatsAppButton';
import { DownloadButton } from './share/components/DownloadButton';

interface InvoiceShareActionsProps {
  invoiceNumber: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  totalAmount: number;
  invoiceRef: React.RefObject<HTMLDivElement>;
  onPrint?: () => void;
  formatGNF: (amount: number) => string;
}

export function InvoiceShareActions({
  invoiceNumber,
  clientName,
  clientPhone,
  clientEmail,
  totalAmount,
  invoiceRef,
  onPrint,
  formatGNF
}: InvoiceShareActionsProps) {
  return (
    <div className="flex justify-center gap-2 flex-wrap">
      <PrintButton 
        invoiceRef={invoiceRef}
        invoiceNumber={invoiceNumber}
        onPrint={onPrint}
      />
      
      <EmailButton
        clientEmail={clientEmail}
        invoiceNumber={invoiceNumber}
        clientName={clientName}
        totalAmount={totalAmount}
        formatGNF={formatGNF}
      />
      
      <WhatsAppButton
        clientPhone={clientPhone}
        invoiceRef={invoiceRef}
        invoiceNumber={invoiceNumber}
        totalAmount={totalAmount}
        formatGNF={formatGNF}
      />
      
      <DownloadButton
        invoiceRef={invoiceRef}
        invoiceNumber={invoiceNumber}
      />
    </div>
  );
}
