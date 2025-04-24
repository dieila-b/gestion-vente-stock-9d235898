
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PurchaseOrderItem } from '@/types/purchase-order';
import { CatalogProduct } from '@/types/catalog';
import { updateOrderTotal } from '../calculations/use-order-calculations';
import { v4 as uuidv4 } from 'uuid';

export function useItemAddRemove(
  orderId: string | undefined,
  orderItems: PurchaseOrderItem[],
  setOrderItems: (items: PurchaseOrderItem[]) => void
) {
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Remove an item from the purchase order
   */
  const removeItem = async (itemId: string): Promise<boolean> => {
    if (!orderId || isProcessing) return false;
    
    console.log(`Removing item ${itemId} from order ${orderId}`);
    setIsProcessing(true);
    
    try {
      // Delete the item from the database
      const { error } = await supabase
        .from('purchase_order_items')
        .delete()
        .eq('id', itemId)
        .eq('purchase_order_id', orderId);
      
      if (error) {
        console.error("Error removing item:", error);
        toast.error("Erreur lors de la suppression de l'article");
        return false;
      }
      
      // Update local state
      const updatedItems = orderItems.filter(item => item.id !== itemId);
      console.log(`Item removed. Updated items count: ${updatedItems.length}`);
      setOrderItems(updatedItems);
      
      // Recalculate order totals
      await updateOrderTotal(orderId, {});
      
      toast.success("Article supprimé");
      return true;
    } catch (error) {
      console.error("Error in removeItem:", error);
      toast.error("Une erreur est survenue");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Add a new product to the purchase order
   */
  const addItem = async (product: CatalogProduct): Promise<boolean> => {
    if (!orderId || isProcessing) return false;
    
    console.log(`Adding product ${product.name} (${product.id}) to order ${orderId}`);
    setIsProcessing(true);
    
    try {
      // Create new item with default values
      const newItem: Partial<PurchaseOrderItem> = {
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
      
      console.log("Creating new item:", newItem);
      
      // Insert the item into the database
      const { error: insertError } = await supabase
        .from('purchase_order_items')
        .insert({
          purchase_order_id: orderId,
          product_id: product.id,
          quantity: 1,
          unit_price: product.purchase_price || 0,
          selling_price: product.price || 0,
          total_price: product.purchase_price || 0
        });
      
      if (insertError) {
        console.error("Error adding item:", insertError);
        toast.error("Erreur lors de l'ajout de l'article");
        return false;
      }
      
      // Fetch the newly inserted item to get its database ID
      const { data: newItemData, error: fetchError } = await supabase
        .from('purchase_order_items')
        .select(`
          id,
          purchase_order_id,
          product_id,
          quantity,
          unit_price,
          selling_price,
          total_price,
          product:product_id (
            id,
            name,
            reference
          )
        `)
        .eq('purchase_order_id', orderId)
        .eq('product_id', product.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (fetchError) {
        console.error("Error fetching new item:", fetchError);
        // Continue with the locally created item ID
        console.log("Using locally created item instead");
        
        // Update local state
        const updatedItems = [...orderItems, newItem as PurchaseOrderItem];
        console.log(`Item added. Updated items count: ${updatedItems.length}`);
        setOrderItems(updatedItems);
        
        // Recalculate order totals
        await updateOrderTotal(orderId, {});
        
        toast.success("Article ajouté");
        return true;
      }
      
      if (newItemData) {
        // Update local state with the real database ID
        const updatedItems = [...orderItems, newItemData as PurchaseOrderItem];
        console.log(`Item added with ID ${newItemData.id}. Updated items count: ${updatedItems.length}`);
        setOrderItems(updatedItems);
      } else {
        // Fallback to local item if the fetch didn't return anything
        const updatedItems = [...orderItems, newItem as PurchaseOrderItem];
        console.log(`Using local item ID. Updated items count: ${updatedItems.length}`);
        setOrderItems(updatedItems);
      }
      
      // Recalculate order totals
      await updateOrderTotal(orderId, {});
      
      toast.success("Article ajouté");
      return true;
    } catch (error) {
      console.error("Error in addItem:", error);
      toast.error("Une erreur est survenue");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    removeItem,
    addItem
  };
}
