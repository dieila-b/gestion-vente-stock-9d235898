
import { CheckCircle2 } from "lucide-react";

interface PaymentStatusProps {
  status: 'paid' | 'partial' | 'pending';
  deliveryStatus: string;
}

export function PaymentStatus({ status, deliveryStatus }: PaymentStatusProps) {
  return (
    <div className="space-y-2">
      {status === 'paid' && (
        <div className="bg-green-50 p-2 rounded-md border-l-4 border-green-500">
          <div className="flex items-center">
            <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-700 text-xs">Cette facture a été intégralement payée.</span>
          </div>
        </div>
      )}
      
      {deliveryStatus === 'delivered' && (
        <div className="bg-green-50 p-2 rounded-md border-l-4 border-green-500">
          <div className="flex items-center">
            <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-700 text-xs">Cette commande a été entièrement livrée.</span>
          </div>
        </div>
      )}
      
      {status === 'partial' && (
        <div className="bg-yellow-50 p-2 rounded-md border-l-4 border-yellow-500">
          <span className="text-yellow-700 text-xs">Un paiement partiel a été effectué sur cette facture.</span>
        </div>
      )}
      
      {deliveryStatus === 'partial' && (
        <div className="bg-yellow-50 p-2 rounded-md border-l-4 border-yellow-500">
          <span className="text-yellow-700 text-xs">Cette commande a été partiellement livrée.</span>
        </div>
      )}
    </div>
  );
}
