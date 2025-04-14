
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePurchaseData } from './edit/use-purchase-data';
import { usePurchaseItems } from './edit/use-purchase-items';
import { usePurchaseStatus } from './edit/use-purchase-status';
import { updateOrderTotal } from './edit/use-purchase-calculations';

export function usePurchaseEdit(orderId?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState<'pending' | 'delivered'>('pending');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'partial' | 'paid'>('pending');
  
  // Get purchase data using the extracted hook
  const { 
    purchase, 
    formData, 
    orderItems, 
    setOrderItems,
    updateFormField, 
    isPurchaseLoading, 
    refetch 
  } = usePurchaseData(orderId);

  // Update delivery and payment status based on purchase data
  if (purchase && purchase.status && purchase.status !== deliveryStatus) {
    setDeliveryStatus(purchase.status as 'pending' | 'delivered');
  }

  if (purchase && purchase.payment_status && purchase.payment_status !== paymentStatus) {
    setPaymentStatus(purchase.payment_status as 'pending' | 'partial' | 'paid');
  }

  // Handle update
  const handleUpdate = async (data: any) => {
    if (!orderId) return false;

    setIsLoading(true);
    try {
      // Update purchase order
      const { error } = await supabase
        .from('purchase_orders')
        .update(data)
        .eq('id', orderId);

      if (error) throw error;

      // Refetch the purchase order to get updated data
      await refetch();

      toast.success('Bon de commande mis à jour avec succès');
      setIsLoading(false);
      return true;
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
      setIsLoading(false);
      return false;
    }
  };

  // Get items management functions
  const { updateItemQuantity, updateOrderItem } = usePurchaseItems(
    orderId,
    orderItems,
    setOrderItems,
    formData,
    refetch
  );

  // Get status management functions
  const { updateStatus, updatePaymentStatus } = usePurchaseStatus(
    orderId,
    formData,
    updateFormField,
    handleUpdate
  );

  // Save all form data
  const saveChanges = async () => {
    const success = await handleUpdate(formData);
    
    if (success) {
      // After saving form data, update the order total
      await updateOrderTotal(orderId!, formData, refetch);
      return true;
    }
    
    return false;
  };

  return {
    purchase,
    formData,
    orderItems,
    isLoading: isLoading || isPurchaseLoading,
    handleUpdate,
    updateFormField,
    updateOrderItem,
    updateItemQuantity,
    saveChanges,
    deliveryStatus,
    paymentStatus,
    updateStatus,
    updatePaymentStatus
  };
}
