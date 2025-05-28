
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PurchaseOrderItem } from '@/types/purchase-order';
import { CatalogProduct } from '@/types/catalog';

export function useItemAddRemove(
  orderId: string | undefined,
  orderItems: PurchaseOrderItem[],
  setOrderItems: (items: PurchaseOrderItem[]) => void
) {
  const [isProcessing, setIsProcessing] = useState(false);

  const addItem = async (product: CatalogProduct): Promise<boolean> => {
    if (!orderId || isProcessing) return false;
    
    setIsProcessing(true);
    try {
      console.log("Adding product to order:", product.name);
      
      // Create new item data
      const newItemData = {
        id: crypto.randomUUID(),
        purchase_order_id: orderId,
        product_id: product.id,
        quantity: 1,
        unit_price: product.purchase_price || 0,
        selling_price: product.price || 0,
        total_price: product.purchase_price || 0,
      };

      // Insert into database
      const { data, error } = await supabase
        .from('purchase_order_items')
        .insert(newItemData)
        .select(`
          id,
          product_id,
          quantity,
          unit_price,
          selling_price,
          total_price,
          product:catalog(id, name, reference)
        `)
        .single();

      if (error) {
        console.error("Error adding item:", error);
        toast.error("Erreur lors de l'ajout de l'article");
        return false;
      }

      // Update local state
      const newItem: PurchaseOrderItem = {
        id: data.id,
        product_id: data.product_id,
        quantity: data.quantity,
        unit_price: data.unit_price,
        selling_price: data.selling_price,
        total_price: data.total_price,
        product: data.product ? {
          id: data.product.id,
          name: data.product.name,
          reference: data.product.reference
        } : {
          id: product.id,
          name: product.name,
          reference: product.reference || ''
        }
      };

      setOrderItems([...orderItems, newItem]);
      toast.success("Article ajouté avec succès");
      return true;

    } catch (error) {
      console.error("Exception adding item:", error);
      toast.error("Erreur lors de l'ajout de l'article");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const removeItem = async (itemId: string): Promise<boolean> => {
    if (!orderId || isProcessing) return false;
    
    setIsProcessing(true);
    try {
      console.log("Removing item:", itemId);
      
      // Remove from database
      const { error } = await supabase
        .from('purchase_order_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error("Error removing item:", error);
        toast.error("Erreur lors de la suppression de l'article");
        return false;
      }

      // Update local state
      setOrderItems(orderItems.filter(item => item.id !== itemId));
      toast.success("Article supprimé avec succès");
      return true;

    } catch (error) {
      console.error("Exception removing item:", error);
      toast.error("Erreur lors de la suppression de l'article");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    addItem,
    removeItem,
    isProcessing
  };
}
