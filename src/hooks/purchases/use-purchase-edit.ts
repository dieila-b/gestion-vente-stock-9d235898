
import React from 'react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePurchaseData } from './edit/use-purchase-data';
import { usePurchaseItems } from './edit/use-purchase-items';
import { usePurchaseStatus } from './edit/use-purchase-status';
import { updateOrderTotal } from './edit/use-purchase-calculations';
import { PurchaseOrder } from '@/types/purchase-order';
import { CatalogProduct } from '@/types/catalog';

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

  console.log("usePurchaseEdit initialized with orderItems:", orderItems?.length || 0);

  // Update delivery and payment status based on purchase data
  React.useEffect(() => {
    if (purchase) {
      if (purchase.status && (purchase.status === 'pending' || purchase.status === 'delivered')) {
        setDeliveryStatus(purchase.status);
      }

      if (purchase.payment_status && 
         (purchase.payment_status === 'pending' || 
          purchase.payment_status === 'partial' || 
          purchase.payment_status === 'paid')) {
        setPaymentStatus(purchase.payment_status);
      }
    }
  }, [purchase]);

  // Handle update
  const handleUpdate = async (data: Partial<PurchaseOrder>) => {
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
  const { 
    updateItemQuantity, 
    updateItemPrice, 
    removeItem,
    addItem
  } = usePurchaseItems(
    orderId,
    orderItems,
    setOrderItems,
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
    if (!orderId) return false;
    
    // Ensure order total is updated before saving
    try {
      await updateOrderTotal(orderId, formData, refetch);
      const success = await handleUpdate(formData);
      return success;
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Erreur lors de l'enregistrement des modifications");
      return false;
    }
  };

  return {
    purchase,
    formData,
    orderItems,
    isLoading: isLoading || isPurchaseLoading,
    handleUpdate,
    updateFormField,
    updateItemQuantity,
    updateItemPrice,
    removeItem,
    addItem,
    saveChanges,
    deliveryStatus,
    paymentStatus,
    updateStatus,
    updatePaymentStatus
  };
}
