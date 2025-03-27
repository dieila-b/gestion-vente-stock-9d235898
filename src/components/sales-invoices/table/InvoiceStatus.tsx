
interface PaymentStatusProps {
  status: string;
}

export function PaymentStatus({ status }: PaymentStatusProps) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs ${
      status === 'paid' 
        ? 'bg-green-500/10 text-green-500'
        : status === 'partial'
        ? 'bg-yellow-500/10 text-yellow-500'
        : 'bg-red-500/10 text-red-500'
    }`}>
      {status === 'paid' 
        ? 'Payé'
        : status === 'partial'
        ? 'Partiellement payé'
        : 'En attente de paiement'}
    </span>
  );
}

interface DeliveryStatusProps {
  status: string | null;
}

export function DeliveryStatus({ status }: DeliveryStatusProps) {
  const getBadgeClass = (status: string | null) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500/10 text-green-500';
      case 'partial':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'awaiting':
        return 'bg-blue-500/10 text-blue-500';
      case 'pending': 
        return 'bg-blue-500/10 text-blue-500';
      default:
        return 'bg-blue-500/10 text-blue-500';
    }
  };

  const getLabel = (status: string | null) => {
    switch (status) {
      case 'delivered':
        return 'Entièrement livré';
      case 'partial':
        return 'Partiellement livré';
      case 'awaiting':
        return 'En attente de livraison';
      case 'pending':
        return 'En attente de livraison';
      default:
        return 'En attente de livraison';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${getBadgeClass(status)}`}>
      {getLabel(status)}
    </span>
  );
}
