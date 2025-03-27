
import { formatGNF } from "@/lib/currency";
import { getDeliveryStatusLabel } from "@/hooks/pos/payment/invoice-template/utils/deliveryStatus";

interface PaymentInfoProps {
  paymentStatus: 'paid' | 'partial' | 'pending';
  paidAmount: number;
  remainingAmount: number;
  deliveryStatus: string;
}

export function PaymentInfo({ 
  paymentStatus, 
  paidAmount, 
  remainingAmount,
  deliveryStatus 
}: PaymentInfoProps) {
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <h3 className="font-bold text-sm">Statut de paiement</h3>
        <div className="flex justify-between text-xs">
          <span className="font-semibold">Statut:</span>
          <span className={paymentStatus === 'paid' 
            ? 'text-green-600 font-semibold' 
            : paymentStatus === 'partial' 
              ? 'text-yellow-600 font-semibold' 
              : 'text-red-600 font-semibold'
          }>
            {paymentStatus === 'paid' 
              ? 'Payé' 
              : paymentStatus === 'partial' 
                ? 'Partiellement payé' 
                : 'En attente de paiement'}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="font-semibold">Montant payé:</span>
          <span>{formatGNF(paidAmount)}</span>
        </div>
        {paymentStatus === 'partial' && (
          <div className="flex justify-between text-xs">
            <span className="font-semibold">Montant restant:</span>
            <span>{formatGNF(remainingAmount)}</span>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="font-bold text-sm">Statut de livraison</h3>
        <div className="flex justify-between text-xs">
          <span className="font-semibold">Statut:</span>
          <span className={deliveryStatus === 'delivered' 
            ? 'text-green-600 font-semibold' 
            : deliveryStatus === 'partial' 
              ? 'text-yellow-600 font-semibold' 
              : 'text-blue-600 font-semibold'
          }>
            {getDeliveryStatusLabel(deliveryStatus)}
          </span>
        </div>
      </div>
    </div>
  );
}
