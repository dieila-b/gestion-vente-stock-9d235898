
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { calculateItemsTotal, updateOrderTotal } from './use-purchase-calculations';

/**
 * Hook for managing purchase order item operations
 */
export function usePurchaseItems(
  orderId: string | undefined,
  orderItems: any[],
  setOrderItems: (items: any[]) => void,
  formData: any,
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
      
      // Calculate new items total and update the order total
      const itemsTotal = calculateItemsTotal(updatedItems);
      await updateOrderTotal(orderId, formData, refetch);
      
      toast.success('Quantité mise à jour avec succès');
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

      toast.success('Produit mis à jour avec succès');
      return true;
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
      return false;
    }
  };

  return {
    updateItemQuantity,
    updateOrderItem
  };
}
