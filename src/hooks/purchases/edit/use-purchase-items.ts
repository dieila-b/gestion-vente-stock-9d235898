
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { updateOrderTotal } from './use-purchase-calculations';
import { PurchaseOrderItem } from '@/types/purchase-order';
import { CatalogProduct } from '@/types/catalog';
import { v4 as uuidv4 } from 'uuid';

/**
 * Hook for managing purchase order item operations
 */
export function usePurchaseItems(
  orderId: string | undefined,
  orderItems: PurchaseOrderItem[],
  setOrderItems: (items: PurchaseOrderItem[]) => void,
  refetch: () => Promise<any>
) {
  console.log("usePurchaseItems initialized with", { orderId, itemsCount: orderItems?.length });

  // Update order item quantity
  const updateItemQuantity = async (itemId: string, newQuantity: number) => {
    if (!orderId || !itemId) return false;
    
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
    if (!orderId || !itemId) return false;
    
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
    if (!orderId || !itemId) return false;
    
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

  // Add new item to order - CORRECTED IMPLEMENTATION
  const addItem = async (product: CatalogProduct) => {
    if (!orderId) {
      console.error("Missing orderId in addItem");
      toast.error("Erreur: ID de commande manquant");
      return false;
    }
    
    if (!product || !product.id) {
      console.error("Invalid product in addItem:", product);
      toast.error("Erreur: Produit invalide");
      return false;
    }
    
    console.log("Adding product to order:", { orderId, productId: product.id, productName: product.name });
    
    try {
      // Generate a unique ID for the new item
      const newItemId = uuidv4();
      
      // Prepare item data
      const quantity = 1;
      const unitPrice = product.purchase_price || 0;
      const totalPrice = quantity * unitPrice;
      
      // Create a new item locally first for immediate UI update
      const newItem: PurchaseOrderItem = {
        id: newItemId,
        purchase_order_id: orderId,
        product_id: product.id,
        quantity: quantity,
        unit_price: unitPrice,
        selling_price: product.price || 0,
        total_price: totalPrice,
        product: {
          name: product.name,
          reference: product.reference
        }
      };
      
      console.log("Created local item:", newItem);
      
      // Update local state IMMEDIATELY for responsive UI
      const updatedItems = [...orderItems, newItem];
      setOrderItems(updatedItems);
      
      console.log("Updated local items array, now has", updatedItems.length, "items");
      
      // Create the item data array for the RPC function
      const itemData = [{
        id: newItemId,
        purchase_order_id: orderId,
        product_id: product.id,
        quantity: quantity,
        unit_price: unitPrice,
        selling_price: product.price || 0,
        total_price: totalPrice,
        created_at: new Date().toISOString()
      }];
      
      console.log("Sending item data to RPC:", itemData);
      
      // Send to database using RPC to bypass RLS
      const { data, error } = await supabase
        .rpc('bypass_insert_purchase_order_items', {
          items_data: itemData
        });
      
      if (error) {
        console.error("Error inserting item with RPC:", error);
        // Revert local state if DB operation fails
        setOrderItems(orderItems);
        throw error;
      }
      
      console.log("RPC insert result:", data);
      
      // Update order total
      await updateOrderTotal(orderId, null, refetch);
      
      toast.success(`Produit "${product.name}" ajouté avec succès`);
      return true;
    } catch (error: any) {
      console.error("Failed to add product:", error);
      toast.error(`Erreur: ${error.message}`);
      return false;
    }
  };

  return {
    updateItemQuantity,
    updateItemPrice,
    removeItem,
    addItem
  };
}
