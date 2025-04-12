
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function usePurchaseEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState<'pending' | 'delivered'>('pending');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'partial' | 'paid'>('pending');

  // Fetch the purchase order 
  const { data: purchase, isLoading: isPurchaseLoading } = useQuery({
    queryKey: ['purchase', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          supplier:supplier_id(id, name, phone, email),
          items:purchase_order_items(
            id,
            product_id,
            quantity,
            unit_price,
            total_price,
            product:catalog(id, name, reference, category)
          ),
          warehouse:warehouse_id(id, name)
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!id
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
    if (!id) return;

    setIsLoading(true);
    try {
      // Update purchase order
      const { error } = await supabase
        .from('purchase_orders')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      toast.success('Purchase order updated successfully');
      setIsLoading(false);
      navigate('/purchases');
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
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
      toast.error(`Error updating status: ${error.message}`);
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
      toast.error(`Error updating payment status: ${error.message}`);
    }
  };

  return {
    id,
    purchase,
    isLoading: isLoading || isPurchaseLoading,
    handleUpdate,
    deliveryStatus,
    paymentStatus,
    updateStatus,
    updatePaymentStatus
  };
}
