
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { updateOrderTotal } from './use-purchase-calculations';

/**
 * Hook for managing purchase order item operations
 */
export function usePurchaseItems(
  orderId: string | undefined,
  orderItems: any[],
  setOrderItems: (items: any[]) => void,
  refetch: () => Promise<any>
) {
  // Update order item quantity
  const updateItemQuantity = async (itemId: string, newQuantity: number) => {
    if (!orderId) return false;
    
    try {
      // First, get the current item to calculate new total price
      const itemToUpdate = orderItems.find(item => item.id === itemId);
      if (!itemToUpdate) {
        throw new Error("Item not found");
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
        throw new Error("Item not found");
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

  // Handle update of specific items
  const updateOrderItem = async (itemId: string, updates: any) => {
    if (!orderId) return false;

    try {
      const { error } = await supabase
        .from('purchase_order_items')
        .update(updates)
        .eq('id', itemId);

      if (error) throw error;
      
      // Update the order total
      await updateOrderTotal(orderId, null, refetch);

      toast.success('Produit mis à jour avec succès');
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
      
      toast.success('Produit supprimé avec succès');
      return true;
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
      return false;
    }
  };

  return {
    updateItemQuantity,
    updateItemPrice,
    updateOrderItem,
    removeItem
  };
}
