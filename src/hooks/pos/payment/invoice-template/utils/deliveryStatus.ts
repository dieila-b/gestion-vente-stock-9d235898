
/**
 * Get a human-readable label for the delivery status
 */
export function getDeliveryStatusLabel(status: string | null): string {
  switch (status) {
    case 'delivered':
      return 'Entièrement livré';
    case 'partial':
      return 'Partiellement livré';
    case 'awaiting':
      return 'En attente de livraison';
    case 'pending':
    default:
      return 'Non livrée';
  }
}
