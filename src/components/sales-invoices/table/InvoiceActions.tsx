
import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer, DollarSign, TruckIcon } from 'lucide-react';

interface InvoiceActionsProps {
  invoice: any;
  handleViewInvoice: (invoice: any) => void;
  handleDeliveryUpdate: (invoice: any) => void;
  handlePayment: (invoice: any) => void;
}

export function InvoiceActions({ 
  invoice,
  handleViewInvoice,
  handleDeliveryUpdate,
  handlePayment
}: InvoiceActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => handleViewInvoice(invoice)}
        size="sm"
        variant="outline"
        className="bg-white/5 hover:bg-white/10 border-white/10"
        title="Voir et imprimer la facture"
      >
        <Printer className="w-4 h-4" />
      </Button>
      
      {/* Delivery update button - only show for invoices that are partially delivered or awaiting delivery */}
      {(invoice.delivery_status === 'partial' || invoice.delivery_status === 'awaiting') && (
        <Button
          onClick={() => handleDeliveryUpdate(invoice)}
          size="sm"
          variant="outline"
          title="Mettre à jour la livraison"
          className="bg-blue-500/30 hover:bg-blue-500/40 border-blue-500/30"
        >
          <TruckIcon className="w-4 h-4" />
        </Button>
      )}
      
      {/* Payment button - only show if not fully paid */}
      {invoice.payment_status !== 'paid' && (
        <Button
          onClick={() => handlePayment(invoice)}
          size="sm"
          variant="outline"
          title="Ajouter un règlement"
          className="bg-green-500/30 hover:bg-green-500/40 border-green-500/30"
        >
          <DollarSign className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
