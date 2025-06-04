
import { Button } from "@/components/ui/button";
import { FileText, Edit, DollarSign, TruckIcon } from "lucide-react";
import { formatGNF } from "@/lib/currency";
import { formatDate } from "@/lib/formatters";

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
  
  // Helper function to get payment status color
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600';
      case 'partial':
        return 'text-yellow-600';
      case 'pending':
      default:
        return 'text-red-600';
    }
  };

  // Helper function to get delivery status color
  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600';
      case 'partial':
        return 'text-yellow-600';
      case 'awaiting':
        return 'text-blue-600';
      case 'pending':
      default:
        return 'text-gray-600';
    }
  };

  // Helper function to get payment status label
  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Payé';
      case 'partial':
        return 'Partiel';
      case 'pending':
      default:
        return 'En attente';
    }
  };

  // Helper function to get delivery status label
  const getDeliveryStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Livré';
      case 'partial':
        return 'Partiel';
      case 'awaiting':
        return 'En attente de livraison';
      case 'pending':
      default:
        return 'En attente';
    }
  };

  return (
    <tr className="hover:bg-white/5 border-b border-white/10">
      <td className="p-2 md:p-3">
        <div className="text-xs md:text-sm font-medium">
          #{invoice.id?.substring(0, 8) || 'N/A'}
        </div>
        <div className="text-xs text-gray-400">
          {formatDate(invoice.created_at)}
        </div>
      </td>
      
      <td className="p-2 md:p-3">
        <div className="text-xs md:text-sm">
          {invoice.client?.company_name || invoice.client?.contact_name || 'Client comptoir'}
        </div>
        {invoice.client?.email && (
          <div className="text-xs text-gray-400">
            {invoice.client.email}
          </div>
        )}
      </td>
      
      <td className="p-2 md:p-3 text-xs md:text-sm">
        {getItemsSummary(invoice)}
      </td>
      
      <td className="p-2 md:p-3">
        <div className="text-xs md:text-sm font-medium">
          {formatGNF(invoice.final_total || invoice.total || 0)}
        </div>
        {(invoice.paid_amount > 0) && (
          <div className="text-xs text-green-400">
            Payé: {formatGNF(invoice.paid_amount)}
          </div>
        )}
      </td>
      
      <td className="p-2 md:p-3">
        <span className={`text-xs font-medium ${getPaymentStatusColor(invoice.payment_status)}`}>
          {getPaymentStatusLabel(invoice.payment_status)}
        </span>
      </td>
      
      <td className="p-2 md:p-3">
        <span className={`text-xs font-medium ${getDeliveryStatusColor(invoice.delivery_status)}`}>
          {getDeliveryStatusLabel(invoice.delivery_status)}
        </span>
      </td>
      
      <td className="p-2 md:p-3">
        <div className="flex flex-wrap gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewInvoice(invoice)}
            className="h-7 w-7 p-0 hover:bg-white/10"
          >
            <FileText className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditInvoice(invoice)}
            className="h-7 w-7 p-0 hover:bg-white/10"
          >
            <Edit className="h-3 w-3" />
          </Button>
          
          {invoice.payment_status !== 'paid' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePayment(invoice)}
              className="h-7 w-7 p-0 hover:bg-white/10"
            >
              <DollarSign className="h-3 w-3" />
            </Button>
          )}
          
          {invoice.delivery_status !== 'delivered' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeliveryUpdate(invoice)}
              className="h-7 w-7 p-0 hover:bg-white/10"
            >
              <TruckIcon className="h-3 w-3" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
