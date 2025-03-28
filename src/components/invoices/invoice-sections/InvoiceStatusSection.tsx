
import { formatGNF } from "@/lib/currency";

interface InvoiceStatusSectionProps {
  paymentStatus: 'paid' | 'partial' | 'pending';
  paidAmount: number;
  remainingAmount: number;
  deliveryStatus: 'delivered' | 'partial' | 'pending' | 'awaiting';
}

export function InvoiceStatusSection({ 
  paymentStatus, 
  paidAmount, 
  remainingAmount, 
  deliveryStatus 
}: InvoiceStatusSectionProps) {
  // Format status labels
  const getPaymentStatusLabel = () => {
    switch (paymentStatus) {
      case 'paid': return 'Payé';
      case 'partial': return 'Partiellement payé';
      default: return 'En attente';
    }
  };
  
  const getDeliveryStatusLabel = () => {
    switch (deliveryStatus) {
      case 'delivered': return 'Entièrement livré';
      case 'partial': return 'Partiellement livré';
      case 'awaiting': return 'En attente de livraison';
      default: return 'En attente';
    }
  };

  return (
    <div className="border-b border-black">
      <div className="grid grid-cols-2">
        <div className="border-r border-black">
          <div className="p-2 font-bold border-b border-black">Statut de paiement</div>
          <div className="grid grid-cols-2 border-b border-black">
            <div className="p-2 border-r border-black">Statut:</div>
            <div className="p-2 font-semibold">{getPaymentStatusLabel()}</div>
          </div>
          <div className="grid grid-cols-2 border-b border-black">
            <div className="p-2 border-r border-black">Montant payé:</div>
            <div className="p-2 text-right">{formatGNF(paidAmount)}</div>
          </div>
          
          {paymentStatus === 'paid' && (
            <div className="p-2 text-green-600 flex items-center border-t border-black">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              Cette facture a été intégralement payée.
            </div>
          )}
        </div>
        
        <div>
          <div className="p-2 font-bold border-b border-black">Statut de livraison</div>
          <div className="grid grid-cols-2 border-b border-black">
            <div className="p-2 border-r border-black">Statut:</div>
            <div className="p-2 font-semibold">{getDeliveryStatusLabel()}</div>
          </div>
          
          {deliveryStatus === 'delivered' && (
            <div className="p-2 text-green-600 flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              Cette commande a été entièrement livrée.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
