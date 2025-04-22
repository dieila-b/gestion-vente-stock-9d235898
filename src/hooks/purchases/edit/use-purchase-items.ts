
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { updateOrderTotal } from './use-purchase-calculations';
import { PurchaseOrderItem } from '@/types/purchase-order';

/**
 * Hook for managing purchase order item operations
 */
export function usePurchaseItems(
  orderId: string | undefined,
  orderItems: PurchaseOrderItem[],
  setOrderItems: (items: PurchaseOrderItem[]) => void,
  refetch: () => Promise<any>
) {
  // Update order item quantity
  const updateItemQuantity = async (itemId: string, newQuantity: number) => {
    if (!orderId) return false;
    
    try {
      // First, get the current item to calculate new total price
      const itemToUpdate = orderItems.find(item => item.id === itemId);
      if (!itemToUpdate) {
        throw new Error("Article non trouvé");
      }
      
      const newTotalPrice = newQuantity * itemToUpdate.unit_price;
      
      // Update the item in the database
      const { error } = await supabase
        .from('purchase_order_items')
        .update({ 
          quantity: newQuantity,
          total_price: newTotalPrice 
        })
        .eq('id', itemId);

      if (error) throw error;
      
      // Update local state
      const updatedItems = orderItems.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity, total_price: newTotalPrice } 
          : item
      );
      
      setOrderItems(updatedItems);
      
      // Update the order total
      await updateOrderTotal(orderId, null, refetch);
      
      toast.success('Quantité mise à jour avec succès');
      return true;
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
      return false;
    }
  };

  // Update item price
  const updateItemPrice = async (itemId: string, newPrice: number) => {
    if (!orderId) return false;
    
    try {
      // Get the current item to calculate new total price
      const itemToUpdate = orderItems.find(item => item.id === itemId);
      if (!itemToUpdate) {
        throw new Error("Article non trouvé");
      }
      
      const newTotalPrice = itemToUpdate.quantity * newPrice;
      
      // Update the item in the database
      const { error } = await supabase
        .from('purchase_order_items')
        .update({ 
          unit_price: newPrice,
          total_price: newTotalPrice 
        })
        .eq('id', itemId);

      if (error) throw error;
      
      // Update local state
      const updatedItems = orderItems.map(item => 
        item.id === itemId 
          ? { ...item, unit_price: newPrice, total_price: newTotalPrice } 
          : item
      );
      
      setOrderItems(updatedItems);
      
      // Update the order total
      await updateOrderTotal(orderId, null, refetch);
      
      toast.success('Prix mis à jour avec succès');
      return true;
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
      return false;
    }
  };

  // Remove item from order
  const removeItem = async (itemId: string) => {
    if (!orderId) return false;
    
    try {
      // Delete the item from the database
      const { error } = await supabase
        .from('purchase_order_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      
      // Update local state
      const updatedItems = orderItems.filter(item => item.id !== itemId);
      setOrderItems(updatedItems);
      
      // Update the order total
      await updateOrderTotal(orderId, null, refetch);
      
      toast.success('Article supprimé avec succès');
      return true;
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
      return false;
    }
  };

  return {
    updateItemQuantity,
    updateItemPrice,
    removeItem
  };
}
