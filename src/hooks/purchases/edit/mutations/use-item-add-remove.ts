
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

  // Add a new item to the purchase order
  const addItem = async (product: CatalogProduct): Promise<boolean> => {
    if (!orderId) {
      console.error("Missing orderId for item addition");
      return false;
    }

    setIsLoading(true);
    try {
      console.log(`Adding product ${product.id} to purchase order ${orderId}`);
      
      // Set default values for the new item
      const newItemId = uuidv4();
      const defaultQuantity = 1;
      const defaultPrice = product.purchase_price || product.price || 0;
      const totalPrice = defaultQuantity * defaultPrice;

      // Create the new item in the database
      const { data, error } = await supabase
        .from('purchase_order_items')
        .insert({
          id: newItemId,
          purchase_order_id: orderId,
          product_id: product.id,
          quantity: defaultQuantity,
          unit_price: defaultPrice,
          selling_price: product.price || 0,
          total_price: totalPrice,
          created_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error("Error adding item to purchase order:", error);
        toast.error("Erreur lors de l'ajout du produit");
        return false;
      }

      console.log("Item added successfully:", data);

      // Update the local state with the new item
      const newItem: PurchaseOrderItem = {
        id: newItemId,
        purchase_order_id: orderId,
        product_id: product.id,
        quantity: defaultQuantity,
        unit_price: defaultPrice,
        selling_price: product.price || 0,
        total_price: totalPrice,
        product: {
          id: product.id,
          name: product.name,
          reference: product.reference
        }
      };

      // Add the new item to the list
      setOrderItems([...orderItems, newItem]);
      toast.success("Produit ajouté avec succès");
      return true;
    } catch (error) {
      console.error("Error in addItem:", error);
      toast.error("Une erreur s'est produite lors de l'ajout du produit");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove an item from the purchase order
  const removeItem = async (itemId: string): Promise<boolean> => {
    if (!orderId || !itemId) {
      console.error("Missing orderId or itemId for item removal");
      return false;
    }

    setIsLoading(true);
    try {
      console.log(`Removing item ${itemId} from purchase order ${orderId}`);

      // Delete the item from the database
      const { error } = await supabase
        .from('purchase_order_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error("Error removing item from purchase order:", error);
        toast.error("Erreur lors de la suppression du produit");
        return false;
      }

      console.log("Item removed successfully");

      // Update the local state by filtering out the removed item
      const updatedItems = orderItems.filter(item => item.id !== itemId);
      setOrderItems(updatedItems);
      toast.success("Produit supprimé avec succès");
      return true;
    } catch (error) {
      console.error("Error in removeItem:", error);
      toast.error("Une erreur s'est produite lors de la suppression du produit");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addItem,
    removeItem,
    isLoading
  };
}
