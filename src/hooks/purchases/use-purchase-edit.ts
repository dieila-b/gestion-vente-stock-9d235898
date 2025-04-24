
import React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePurchaseData } from './edit/use-purchase-data';
import { usePurchaseItems } from './edit/use-purchase-items';
import { usePurchaseStatus } from './edit/use-purchase-status';
import { updateOrderTotal } from './edit/calculations/use-order-calculations';
import { PurchaseOrder } from '@/types/purchase-order';
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
    setFormData,
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

  // Calculate current totals
  const calculateTotals = async () => {
    if (!orderId || !formData) return null;
    try {
      return await updateOrderTotal(orderId, formData);
    } catch (error) {
      console.error("Error calculating totals:", error);
      return null;
    }
  };

  // Save all form data
  const saveChanges = async () => {
    if (!orderId) {
      console.error("Missing orderId in saveChanges");
      toast.error("Erreur: ID de commande manquant");
      return false;
    }
    
    console.log("Saving changes with form data:", formData);
    setIsLoading(true);
    
    try {
      if (!formData) {
        throw new Error("No form data available to save");
      }
      
      // Ensure formData has updated_at set to current timestamp
      const dataWithTimestamp = {
        ...formData,
        updated_at: new Date().toISOString()
      };
      
      console.log("Saving changes with prepared data:", dataWithTimestamp);
      
      // Calculate and save the order totals directly without setting intermediate state
      try {
        const totalResult = await updateOrderTotal(orderId, dataWithTimestamp);
        console.log("Total calculation result:", totalResult);
        
        if (!totalResult) {
          throw new Error("Failed to calculate order totals");
        }
        
        // Create a complete data object with all required fields
        const completeData: Partial<PurchaseOrder> = {
          ...dataWithTimestamp,
          subtotal: totalResult.subtotal,
          tax_amount: totalResult.taxAmount,
          total_ttc: totalResult.totalTTC,
          total_amount: totalResult.totalAmount,
          logistics_cost: totalResult.logisticsCost || dataWithTimestamp.logistics_cost,
          transit_cost: totalResult.transitCost || dataWithTimestamp.transit_cost,
          shipping_cost: totalResult.shippingCost || dataWithTimestamp.shipping_cost,
          discount: totalResult.discount || dataWithTimestamp.discount,
          tax_rate: totalResult.tax_rate || dataWithTimestamp.tax_rate,
          status: dataWithTimestamp.status,
          payment_status: dataWithTimestamp.payment_status,
          notes: dataWithTimestamp.notes,
          expected_delivery_date: dataWithTimestamp.expected_delivery_date
        };
        
        console.log("Complete data for update:", completeData);
        
        // Update the purchase order directly using the mutation
        const updatedOrder = await updatePurchaseOrder(orderId, completeData);
        
        if (!updatedOrder) {
          console.error("Failed to update purchase order");
          throw new Error("Erreur lors de la mise à jour du bon de commande");
        }
        
        console.log("Purchase order updated successfully:", updatedOrder);
        
        // Force invalidate and refetch to ensure we have latest data
        await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
        await queryClient.invalidateQueries({ queryKey: ['purchase', orderId] });
        
        await refetch();
        
        setIsLoading(false);
        return true;
        
      } catch (error) {
        console.error("Error with update process:", error);
        throw error;
      }
      
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error(`Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`);
      setIsLoading(false);
      return false;
    }
  };

  // Ensure totals are recalculated whenever orderItems change
  useEffect(() => {
    if (orderId && orderItems && orderItems.length > 0) {
      console.log("Order items changed, recalculating totals...");
      calculateTotals().then(result => {
        if (result) {
          console.log("New calculated totals:", result);
          // Update form data with new totals
          setFormData(prevData => ({
            ...prevData,
            subtotal: result.subtotal,
            tax_amount: result.taxAmount,
            total_ttc: result.totalTTC,
            total_amount: result.totalAmount
          }));
        }
      }).catch(error => {
        console.error("Failed to calculate totals after item change:", error);
      });
    }
  }, [orderId, orderItems]);

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
    updatePaymentStatus,
    setFormData, // Export setFormData to allow direct updates
  };
}
