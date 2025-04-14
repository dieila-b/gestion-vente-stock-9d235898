
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for managing purchase order status operations
 */
export function usePurchaseStatus(
  orderId: string | undefined,
  formData: any,
  setFormData: (data: any) => void,
  handleUpdate: (data: any) => Promise<boolean>
) {
  // Update status
  const updateStatus = async (status: string) => {
    if (!orderId) return;
    
    try {
      if (status === 'pending' || status === 'delivered') {
        setFormData((prev: any) => ({ ...prev, status }));
        await handleUpdate({ status });
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
        setFormData((prev: any) => ({ ...prev, payment_status: status }));
        await handleUpdate({ payment_status: status });
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
