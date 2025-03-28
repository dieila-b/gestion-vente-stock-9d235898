
import React from 'react';

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
  // Removed all buttons as requested
  return null;
}
