
import React from 'react';
import { formatGNF } from '@/lib/currency';
import { formatDate } from '@/lib/formatters';
import { StatusBadge } from './StatusBadge';
import { InvoiceActions } from './InvoiceActions';

interface InvoiceTableRowProps {
  invoice: any;
  getItemsSummary: (invoice: any) => string;
  handleViewInvoice: (invoice: any) => void;
  handleEditInvoice: (invoice: any) => void;
  handlePayment: (invoice: any) => void;
  handleDeliveryUpdate: (invoice: any) => void;
}

export function InvoiceTableRow({
  invoice,
  getItemsSummary,
  handleViewInvoice,
  handleEditInvoice,
  handlePayment,
  handleDeliveryUpdate
}: InvoiceTableRowProps) {
  return (
    <tr key={invoice.id} className="hover:bg-white/5">
      <td className="p-2 md:p-4">
        {invoice.id.slice(0, 8).toUpperCase()}
      </td>
      <td className="p-2 md:p-4">
        {formatDate(invoice.created_at)}
      </td>
      <td className="p-2 md:p-4 truncate max-w-[120px]">
        {invoice.client?.company_name || "Client inconnu"}
      </td>
      <td className="p-2 md:p-4 hidden md:table-cell truncate max-w-[150px]">
        {getItemsSummary(invoice)}
      </td>
      <td className="p-2 md:p-4 whitespace-nowrap">{formatGNF(invoice.final_total)}</td>
      <td className="p-2 md:p-4 whitespace-nowrap hidden md:table-cell">{formatGNF(invoice.paid_amount)}</td>
      <td className="p-2 md:p-4 whitespace-nowrap hidden md:table-cell">{formatGNF(invoice.remaining_amount)}</td>
      <td className="p-2 md:p-4">
        <StatusBadge status={invoice.payment_status} type="payment" />
      </td>
      <td className="p-2 md:p-4">
        <StatusBadge status={invoice.delivery_status} type="delivery" />
      </td>
      <td className="p-2 md:p-4">
        <InvoiceActions
          invoice={invoice}
          handleViewInvoice={handleViewInvoice}
          handleDeliveryUpdate={handleDeliveryUpdate}
          handlePayment={handlePayment}
        />
      </td>
    </tr>
  );
}
