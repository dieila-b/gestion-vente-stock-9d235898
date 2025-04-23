
import React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePurchaseData } from './edit/use-purchase-data';
import { usePurchaseItems } from './edit/use-purchase-items';
import { usePurchaseStatus } from './edit/use-purchase-status';
import { updateOrderTotal } from './edit/use-purchase-calculations';
import { PurchaseOrder } from '@/types/purchase-order';
import { CatalogProduct } from '@/types/catalog';
import { useQueryClient } from '@tanstack/react-query';

export function usePurchaseEdit(orderId?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState<'pending' | 'delivered'>('pending');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'partial' | 'paid'>('pending');
  const queryClient = useQueryClient();
  
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
  console.log("Current form data:", formData);

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
      console.log("Updating purchase order with data:", data);
      
      // Update purchase order
      const { error } = await supabase
        .from('purchase_orders')
        .update(data)
        .eq('id', orderId);

      if (error) {
        console.error("Error updating purchase order:", error);
        toast.error(`Erreur: ${error.message}`);
        setIsLoading(false);
        return false;
      }

      // Refetch the purchase order to get updated data
      await refetch();
      
      // Also invalidate the main purchase orders query
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });

      console.log("Purchase order updated successfully");
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error("Error in handleUpdate:", error);
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
    
    console.log("Saving changes with form data:", formData);
    setIsLoading(true);
    
    try {
      // First ensure order total is updated
      await updateOrderTotal(orderId, formData);
      
      // Then save the rest of the form data
      const dataToUpdate = {
        ...formData,
        updated_at: new Date().toISOString()
      };
      
      console.log("Data being sent to update:", dataToUpdate);
      
      const success = await handleUpdate(dataToUpdate);
      
      if (success) {
        // Force invalidate and refetch to ensure we have latest data
        queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
        await refetch();
      }
      
      setIsLoading(false);
      return success;
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Erreur lors de l'enregistrement des modifications");
      setIsLoading(false);
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
