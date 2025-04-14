
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function usePurchaseEdit(orderId?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState<'pending' | 'delivered'>('pending');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'partial' | 'paid'>('pending');

  // Fetch the purchase order 
  const { data: purchase, isLoading: isPurchaseLoading } = useQuery({
    queryKey: ['purchase', orderId],
    queryFn: async () => {
      if (!orderId) return null;

      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          supplier:suppliers(*),
          items:purchase_order_items(
            id,
            product_id,
            quantity,
            unit_price,
            total_price
          ),
          warehouse:warehouse_id(id, name)
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!orderId
  });

  // Set states when data is loaded
  useEffect(() => {
    if (purchase) {
      setDeliveryStatus(purchase.status as 'pending' | 'delivered');
      setPaymentStatus(purchase.payment_status as 'pending' | 'partial' | 'paid');
    }
  }, [purchase]);

  // Handle update
  const handleUpdate = async (data: any) => {
    if (!orderId) return;

    setIsLoading(true);
    try {
      // Update purchase order
      const { error } = await supabase
        .from('purchase_orders')
        .update(data)
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Bon de commande mis à jour avec succès');
      setIsLoading(false);
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
      setIsLoading(false);
    }
  };

  // Update status
  const updateStatus = async (status: string) => {
    try {
      if (status === 'pending' || status === 'delivered') {
        setDeliveryStatus(status);
        await handleUpdate({ status });
      }
    } catch (error: any) {
      toast.error(`Erreur lors de la mise à jour du statut: ${error.message}`);
    }
  };

  // Update payment status
  const updatePaymentStatus = async (status: string) => {
    try {
      if (status === 'pending' || status === 'partial' || status === 'paid') {
        setPaymentStatus(status);
        await handleUpdate({ payment_status: status });
      }
    } catch (error: any) {
      toast.error(`Erreur lors de la mise à jour du statut de paiement: ${error.message}`);
    }
  };

  return {
    purchase,
    isLoading: isLoading || isPurchaseLoading,
    handleUpdate,
    deliveryStatus,
    paymentStatus,
    updateStatus,
    updatePaymentStatus
  };
}
