
import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePurchaseData } from './edit/use-purchase-data';
import { usePurchaseItems } from './edit/use-purchase-items';
import { usePurchaseStatus } from './edit/use-purchase-status';
import { updateOrderTotal, recalculateOrderTotals } from './edit/calculations/use-order-calculations';
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
    refetch,
    setFormData,
    calculateTotals
  } = usePurchaseData(orderId);

  console.log("usePurchaseEdit initialized with orderItems:", orderItems?.length || 0);
  console.log("Current form data:", formData);

  // Update delivery and payment status based on purchase data
  React.useEffect(() => {
    if (purchase) {
      console.log("Setting status from purchase data:", purchase.status);
      console.log("Setting payment status from purchase data:", purchase.payment_status);
      
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
    refetch,
    calculateTotals
  );

  // Get status management functions
  const { updateStatus, updatePaymentStatus } = usePurchaseStatus(
    orderId,
    formData,
    updateFormField,
    updatePurchaseOrder
  );
  
  // Function to refresh totals
  const refreshTotals = useCallback(async () => {
    if (!orderId) return;
    
    try {
      console.log("Refreshing totals for order:", orderId);
      const updatedTotals = await recalculateOrderTotals(orderId, formData);
      
      // Update form data with new totals
      setFormData(prevData => ({
        ...prevData,
        subtotal: updatedTotals.subtotal,
        tax_amount: updatedTotals.taxAmount,
        total_ttc: updatedTotals.totalTTC,
        total_amount: updatedTotals.totalAmount,
      }));
      
      console.log("Totals refreshed:", updatedTotals);
      return updatedTotals;
    } catch (error) {
      console.error("Error refreshing totals:", error);
    }
  }, [orderId, formData, setFormData]);

  // Auto-refresh totals when items change or form data changes
  useEffect(() => {
    if (orderId && (orderItems.length >= 0 || formData.tax_rate !== undefined)) {
      console.log("Items or form data changed, auto-calculating totals...");
      const timeoutId = setTimeout(() => {
        calculateTotals();
      }, 300); // Debounce for 300ms
      
      return () => clearTimeout(timeoutId);
    }
  }, [orderItems, formData.tax_rate, formData.shipping_cost, formData.transit_cost, formData.logistics_cost, formData.discount, calculateTotals, orderId]);

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
      // Calculate latest totals before saving
      const latestTotals = calculateTotals();
      
      // Ensure formData has updated_at set to current timestamp
      const dataWithTimestamp = {
        ...formData,
        ...latestTotals,
        updated_at: new Date().toISOString()
      };
      
      console.log("Data being sent to update:", dataWithTimestamp);
      
      // Important: Wait for the update to complete
      const updatedOrder = await updatePurchaseOrder(orderId, dataWithTimestamp);
      
      if (!updatedOrder) {
        console.error("Failed to update purchase order");
        toast.error("Erreur lors de la mise à jour du bon de commande");
        setIsLoading(false);
        return false;
      }
      
      console.log("Purchase order updated result:", updatedOrder);
      
      // Force invalidate and refetch to ensure we have latest data
      await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      await queryClient.invalidateQueries({ queryKey: ['purchase-with-items', orderId] });
      
      toast.success("Bon de commande mis à jour avec succès");
      
      // Ensure we finished loading state before returning
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
    updatePaymentStatus,
    refreshTotals
  };
}
