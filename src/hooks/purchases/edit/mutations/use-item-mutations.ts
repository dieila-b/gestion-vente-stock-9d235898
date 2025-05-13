
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PurchaseOrderItem } from '@/types/purchase-order';

export function useItemMutations(
  orderId: string | undefined,
  orderItems: PurchaseOrderItem[],
  setOrderItems: (items: PurchaseOrderItem[]) => void
) {
  const [isLoading, setIsLoading] = useState(false);

  // Update item quantity
  const updateItemQuantity = async (itemId: string, quantity: number) => {
    if (!orderId || !itemId) {
      console.error("Missing orderId or itemId for item update");
      return false;
    }

    setIsLoading(true);
    try {
      console.log(`Updating quantity for item ${itemId} to ${quantity}`);

      // Find the item to update its price
      const item = orderItems.find(item => item.id === itemId);
      if (!item) {
        console.error("Item not found in the order items");
        return false;
      }

      // Calculate the new total price
      const unitPrice = item.unit_price || 0;
      const totalPrice = quantity * unitPrice;

      // Update the database
      const { data, error } = await supabase
        .from('purchase_order_items')
        .update({
          quantity: quantity,
          total_price: totalPrice,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .select();

      if (error) {
        console.error("Error updating item quantity:", error);
        toast.error("Erreur lors de la mise à jour de la quantité");
        return false;
      }

      console.log("Item quantity updated successfully:", data);

      // Update the local state
      const updatedItems = orderItems.map(item => {
        if (item.id === itemId) {
          return { 
            ...item, 
            quantity: quantity, 
            total_price: totalPrice 
          };
        }
        return item;
      });

      setOrderItems(updatedItems);
      return true;
    } catch (error) {
      console.error("Error in updateItemQuantity:", error);
      toast.error("Une erreur s'est produite lors de la mise à jour");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update item price
  const updateItemPrice = async (itemId: string, price: number) => {
    if (!orderId || !itemId) {
      console.error("Missing orderId or itemId for price update");
      return false;
    }

    setIsLoading(true);
    try {
      console.log(`Updating price for item ${itemId} to ${price}`);

      // Find the item to update its price
      const item = orderItems.find(item => item.id === itemId);
      if (!item) {
        console.error("Item not found in the order items");
        return false;
      }

      // Calculate the new total price
      const quantity = item.quantity || 0;
      const totalPrice = quantity * price;

      // Update the database
      const { data, error } = await supabase
        .from('purchase_order_items')
        .update({
          unit_price: price,
          total_price: totalPrice,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .select();

      if (error) {
        console.error("Error updating item price:", error);
        toast.error("Erreur lors de la mise à jour du prix");
        return false;
      }

      console.log("Item price updated successfully:", data);

      // Update the local state
      const updatedItems = orderItems.map(item => {
        if (item.id === itemId) {
          return { 
            ...item, 
            unit_price: price, 
            total_price: totalPrice 
          };
        }
        return item;
      });

      setOrderItems(updatedItems);
      return true;
    } catch (error) {
      console.error("Error in updateItemPrice:", error);
      toast.error("Une erreur s'est produite lors de la mise à jour");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateItemQuantity,
    updateItemPrice,
    isLoading
  };
}
