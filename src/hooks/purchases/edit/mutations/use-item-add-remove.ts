
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PurchaseOrderItem } from '@/types/purchase-order';
import { CatalogProduct } from '@/types/catalog';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

export function useItemAddRemove(
  orderId: string | undefined,
  orderItems: PurchaseOrderItem[],
  setOrderItems: (items: PurchaseOrderItem[]) => void
) {
  const [isLoading, setIsLoading] = useState(false);

  // Remove an item from the purchase order
  const removeItem = async (itemId: string): Promise<boolean> => {
    if (!orderId) {
      console.error('Cannot remove item - no order id');
      return false;
    }

    try {
      setIsLoading(true);
      console.log(`Removing item ${itemId} from order ${orderId}`);

      // Delete the item from the database
      const { error } = await supabase
        .from('purchase_order_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('Error removing purchase order item:', error);
        toast.error("Erreur lors de la suppression de l'article");
        return false;
      }

      // Update the local state
      setOrderItems(orderItems.filter(item => item.id !== itemId));
      console.log('Item removed successfully');
      return true;
    } catch (error) {
      console.error('Error in removeItem:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new item to the purchase order
  const addItem = async (product: CatalogProduct): Promise<boolean> => {
    if (!orderId) {
      console.error('Cannot add item - no order id');
      return false;
    }

    try {
      setIsLoading(true);
      console.log(`Adding product ${product.id} to order ${orderId}`);

      // Create a new item
      const newItem: PurchaseOrderItem = {
        id: uuidv4(),
        purchase_order_id: orderId,
        product_id: product.id,
        quantity: 1,
        unit_price: product.purchase_price || 0,
        selling_price: product.price || 0,
        total_price: product.purchase_price || 0,
        product: {
          id: product.id,
          name: product.name,
          reference: product.reference
        }
      };

      // Insert the new item into the database
      const { error } = await supabase
        .from('purchase_order_items')
        .insert(newItem);

      if (error) {
        console.error('Error adding purchase order item:', error);
        toast.error("Erreur lors de l'ajout de l'article");
        return false;
      }

      // Update the local state
      setOrderItems([...orderItems, newItem]);
      console.log('Item added successfully:', newItem);
      return true;
    } catch (error) {
      console.error('Error in addItem:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    removeItem,
    addItem,
    isLoading
  };
}
