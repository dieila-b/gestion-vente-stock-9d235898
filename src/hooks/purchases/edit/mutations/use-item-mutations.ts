
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PurchaseOrderItem } from '@/types/purchase-order';

export function useItemMutations(
  orderId: string | undefined,
  orderItems: PurchaseOrderItem[],
  setOrderItems: (items: PurchaseOrderItem[]) => void,
  calculateTotals?: () => void
) {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateItemQuantity = async (itemId: string, quantity: number): Promise<boolean> => {
    if (!orderId || isUpdating || quantity <= 0) return false;
    
    setIsUpdating(true);
    try {
      console.log("Updating item quantity:", itemId, quantity);
      
      // Find the item to get unit price
      const item = orderItems.find(i => i.id === itemId);
      if (!item) {
        toast.error("Article non trouvé");
        return false;
      }

      const newTotalPrice = quantity * item.unit_price;

      // Update in database
      const { error } = await supabase
        .from('purchase_order_items')
        .update({
          quantity,
          total_price: newTotalPrice
        })
        .eq('id', itemId);

      if (error) {
        console.error("Error updating quantity:", error);
        toast.error("Erreur lors de la mise à jour de la quantité");
        return false;
      }

      // Update local state
      const updatedItems = orderItems.map(item => 
        item.id === itemId 
          ? { ...item, quantity, total_price: newTotalPrice }
          : item
      );
      
      setOrderItems(updatedItems);
      
      // Recalculate totals after updating items
      if (calculateTotals) {
        setTimeout(calculateTotals, 100);
      }

      console.log("Item quantity updated successfully");
      return true;

    } catch (error) {
      console.error("Exception updating quantity:", error);
      toast.error("Erreur lors de la mise à jour de la quantité");
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateItemPrice = async (itemId: string, price: number): Promise<boolean> => {
    if (!orderId || isUpdating || price < 0) return false;
    
    setIsUpdating(true);
    try {
      console.log("Updating item price:", itemId, price);
      
      // Find the item to get quantity
      const item = orderItems.find(i => i.id === itemId);
      if (!item) {
        toast.error("Article non trouvé");
        return false;
      }

      const newTotalPrice = item.quantity * price;

      // Update in database
      const { error } = await supabase
        .from('purchase_order_items')
        .update({
          unit_price: price,
          total_price: newTotalPrice
        })
        .eq('id', itemId);

      if (error) {
        console.error("Error updating price:", error);
        toast.error("Erreur lors de la mise à jour du prix");
        return false;
      }

      // Update local state
      const updatedItems = orderItems.map(item => 
        item.id === itemId 
          ? { ...item, unit_price: price, total_price: newTotalPrice }
          : item
      );
      
      setOrderItems(updatedItems);
      
      // Recalculate totals after updating items
      if (calculateTotals) {
        setTimeout(calculateTotals, 100);
      }

      console.log("Item price updated successfully");
      return true;

    } catch (error) {
      console.error("Exception updating price:", error);
      toast.error("Erreur lors de la mise à jour du prix");
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateItemQuantity,
    updateItemPrice,
    isUpdating
  };
}
