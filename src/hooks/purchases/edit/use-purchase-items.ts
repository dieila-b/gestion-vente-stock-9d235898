
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

  // Add new item to order
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
    
    console.log("Adding product to order:", { 
      orderId, 
      productId: product.id, 
      productName: product.name 
    });
    
    try {
      // Generate a unique ID for the new item
      const newItemId = uuidv4();
      
      // Prepare item data
      const quantity = 1;
      const unitPrice = product.purchase_price || 0;
      const totalPrice = quantity * unitPrice;
      
      // Prepare the item data for database insertion
      const newItem = {
        id: newItemId,
        purchase_order_id: orderId,
        product_id: product.id,
        quantity: quantity,
        unit_price: unitPrice,
        selling_price: product.price || 0,
        total_price: totalPrice,
        created_at: new Date().toISOString()
      };
      
      console.log("Sending new item to database:", newItem);
      
      // Insert directly to the database table
      const { data: insertedData, error: insertError } = await supabase
        .from('purchase_order_items')
        .insert(newItem)
        .select('*')
        .single();
      
      if (insertError) {
        console.error("Error inserting item:", insertError);
        throw insertError;
      }
      
      console.log("Successfully inserted item:", insertedData);
      
      // Create a new item object for local state update
      const newItemForState: PurchaseOrderItem = {
        id: newItemId,
        purchase_order_id: orderId,
        product_id: product.id,
        quantity: quantity,
        unit_price: unitPrice,
        selling_price: product.price || 0,
        total_price: totalPrice,
        product: {
          id: product.id,
          name: product.name,
          reference: product.reference
        }
      };
      
      // Update local state
      const updatedItems = [...orderItems, newItemForState];
      setOrderItems(updatedItems);
      
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
