
import { toast } from 'sonner';
import { PurchaseOrder } from '@/types/purchase-order';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for managing purchase order status operations
 */
export function usePurchaseStatus(
  orderId: string | undefined,
  formData: any,
  updateFormField: (field: string, value: any) => void,
  handleUpdate: (id: string, data: Partial<PurchaseOrder>) => Promise<PurchaseOrder | null>
) {
  // Update status
  const updateStatus = async (status: string) => {
    if (!orderId) return;
    
    try {
      if (status === 'pending' || status === 'delivered') {
        updateFormField('status', status);
        await handleUpdate(orderId, { status });
      }
    } catch (error: any) {
      toast.error(`Erreur lors de la mise à jour du statut: ${error.message}`);
    }
  };

  // Update payment status
  const updatePaymentStatus = async (status: string) => {
    if (!orderId) return;
    
    try {
      if (status === 'pending' || status === 'partial' || status === 'paid') {
        updateFormField('payment_status', status);
        await handleUpdate(orderId, { payment_status: status });
      }
    } catch (error: any) {
      toast.error(`Erreur lors de la mise à jour du statut de paiement: ${error.message}`);
    }
  };

  return {
    updateStatus,
    updatePaymentStatus
  };
}
