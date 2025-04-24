
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PurchaseOrderItem } from '@/types/purchase-order';
import { CatalogProduct } from '@/types/catalog';
import { v4 as uuidv4 } from 'uuid';
import { updateOrderTotal } from '../calculations/use-order-calculations';

export function useItemAddRemove(
  orderId: string | undefined,
  orderItems: PurchaseOrderItem[],
  setOrderItems: (items: PurchaseOrderItem[]) => void
) {
  const updateItemQuantity = async (itemId: string, newQuantity: number) => {
    if (!orderId || !itemId) return false;
    
    try {
      const itemToUpdate = orderItems.find(item => item.id === itemId);
      if (!itemToUpdate) {
        throw new Error("Article non trouvé");
      }
      
      const newTotalPrice = newQuantity * itemToUpdate.unit_price;
      
      const { error } = await supabase
        .from('purchase_order_items')
        .update({ 
          quantity: newQuantity,
          total_price: newTotalPrice 
        })
        .eq('id', itemId);

      if (error) throw error;
      
      const updatedItems = orderItems.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity, total_price: newTotalPrice } 
          : item
      );
      
      setOrderItems(updatedItems);
      await updateOrderTotal(orderId, {});
      
      toast.success('Quantité mise à jour avec succès');
      return true;
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
      return false;
    }
  };

  const removeItem = async (itemId: string) => {
    if (!orderId || !itemId) return false;
    
    try {
      const { error } = await supabase
        .from('purchase_order_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      
      const updatedItems = orderItems.filter(item => item.id !== itemId);
      setOrderItems(updatedItems);
      
      await updateOrderTotal(orderId, {});
      
      toast.success('Article supprimé avec succès');
      return true;
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
      return false;
    }
  };

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

    const existingItem = orderItems.find(item => item.product_id === product.id);
    
    if (existingItem) {
      console.log("Product already exists in order, incrementing quantity");
      const newQuantity = existingItem.quantity + 1;
      return await updateItemQuantity(existingItem.id, newQuantity);
    }
    
    try {
      const newItemId = uuidv4();
      const quantity = 1;
      const unitPrice = product.purchase_price || 0;
      const totalPrice = quantity * unitPrice;
      
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
      
      const { error: insertError } = await supabase
        .from('purchase_order_items')
        .insert(newItem)
        .select('*')
        .single();
      
      if (insertError) {
        throw new Error(`Impossible d'ajouter l'article. ${insertError.message}`);
      }
      
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
      
      setOrderItems([...orderItems, newItemForState]);
      await updateOrderTotal(orderId, {});
      
      toast.success(`Produit "${product.name}" ajouté avec succès`);
      return true;
    } catch (error: any) {
      console.error("Failed to add product:", error);
      toast.error(`Erreur: ${error.message}`);
      return false;
    }
  };

  return {
    removeItem,
    addItem,
    updateItemQuantity
  };
}
