
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
import { useUpdatePurchaseOrder } from '@/hooks/purchase-orders/mutations/use-update-purchase-order';

export function usePurchaseEdit(orderId?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState<'pending' | 'delivered'>('pending');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'partial' | 'paid'>('pending');
  const queryClient = useQueryClient();
  const updatePurchaseOrder = useUpdatePurchaseOrder();
  
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
    updatePurchaseOrder
  );

  // Save all form data
  const saveChanges = async () => {
    if (!orderId) return false;
    
    console.log("Saving changes with form data:", formData);
    setIsLoading(true);
    
    try {
      // Ensure formData has updated_at set to current timestamp
      const dataWithTimestamp = {
        ...formData,
        updated_at: new Date().toISOString()
      };
      
      // First ensure order total is updated
      const totalResult = await updateOrderTotal(orderId, dataWithTimestamp);
      
      if (!totalResult.success) {
        throw new Error("Échec de la mise à jour des totaux");
      }
      
      // Then save the rest of the form data
      const dataToUpdate = {
        ...dataWithTimestamp,
        // Include the calculated totals to ensure consistency
        subtotal: totalResult.subtotal,
        tax_amount: totalResult.taxAmount,
        total_ttc: totalResult.totalTTC,
        total_amount: totalResult.totalAmount
      };
      
      console.log("Data being sent to update:", dataToUpdate);
      
      const updatedOrder = await updatePurchaseOrder(orderId, dataToUpdate);
      
      if (!updatedOrder) {
        throw new Error("Échec de la mise à jour du bon de commande");
      }
      
      console.log("Purchase order updated successfully:", updatedOrder);
      
      // Force invalidate and refetch to ensure we have latest data
      await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      await queryClient.invalidateQueries({ queryKey: ['purchase', orderId] });
      await refetch();
      
      setIsLoading(false);
      return true;
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
