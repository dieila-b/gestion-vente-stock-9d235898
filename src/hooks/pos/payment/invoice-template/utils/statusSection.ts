
import { formatGNF } from "@/lib/currency";
import { getDeliveryStatusLabel } from "./deliveryStatus";

/**
 * Generate the payment and delivery status section
 */
export function generateStatusSection(
  paymentStatus: 'paid' | 'partial' | 'pending',
  paidAmount: number,
  remainingAmount: number,
  deliveryStatus: 'delivered' | 'partial' | 'pending' | 'awaiting'
): string {
  return `
    <div class="payment-status">
      <div class="status-box">
        <div class="status-title">Statut de paiement</div>
        <div class="status-details">
          <span>Status:</span>
          <span>${paymentStatus === 'paid' 
              ? 'Payé'
              : paymentStatus === 'partial'
              ? 'Partiellement payé'
              : 'En attente de paiement'}</span>
        </div>
        <div class="status-details">
          <span>Montant payé:</span>
          <span>${formatGNF(paidAmount)}</span>
        </div>
        <div class="status-details">
          <span>Reste à payer:</span>
          <span>${formatGNF(remainingAmount)}</span>
        </div>
        
        ${paymentStatus === 'partial' ? `
        <div class="notification payment">
          <div style="display: flex; align-items: center;">
            <span style="color: #856404; margin-right: 8px;">⚠️</span>
            <span>Un paiement partiel a été effectué pour cette facture.</span>
          </div>
        </div>
        ` : ''}
      </div>
      
      <div class="status-box">
        <div class="status-title">Statut de livraison</div>
        <div class="status-details">
          <span>Status:</span>
          <span>${getDeliveryStatusLabel(deliveryStatus)}</span>
        </div>
        
        ${deliveryStatus === 'partial' ? `
        <div class="notification delivery">
          <div style="display: flex; align-items: center;">
            <span style="color: #0c5460; margin-right: 8px;">🚚</span>
            <span>Cette commande a été partiellement livrée.</span>
          </div>
        </div>
        ` : ''}
      </div>
    </div>
  `;
}
