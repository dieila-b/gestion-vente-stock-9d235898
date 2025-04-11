
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { isSelectQueryError, safeGetProperty, safeArrayOperation } from "@/utils/supabase-helpers";

export function useStockCheck(
  setIsUpdating: (value: boolean) => void,
  refetchPreorders: () => void
) {
  const checkStockAvailability = async (orderId: string) => {
    setIsUpdating(true);
    try {
      // Get the order with its items
      const { data: order, error: orderError } = await supabase
        .from('preorders')
        .select(`
          *,
          items:preorder_items(
            id, 
            product_id, 
            quantity, 
            status,
            product:catalog(id, stock)
          )
        `)
        .eq('id', orderId)
        .single();
        
      if (orderError) {
        throw new Error("Commande non trouvée");
      }
      
      let allItemsAvailable = true;
      let updatedItems = 0;
      
      // Safely process the items array
      const items = !isSelectQueryError(order.items) ? order.items || [] : [];
      
      // Check each product
      for (const item of items) {
        if (!item || typeof item !== 'object') continue;
        
        const productId = item.product_id;
        if (!productId) continue;
        
        // Check available stock
        const { data: productData } = await supabase
          .from('catalog')
          .select('stock')
          .eq('id', productId)
          .single();
          
        const itemQuantity = item.quantity || 0;
        const itemStatus = item.status || 'pending';
        const itemId = item.id;
          
        if (productData && productData.stock >= itemQuantity) {
          // Stock available, update item status
          if (itemStatus !== 'available') {
            const { error } = await supabase
              .from('preorder_items')
              .update({ status: 'available' })
              .eq('id', itemId);
              
            if (!error) updatedItems++;
          }
        } else {
          // Update status if product is out of stock
          let newStatus = itemStatus;
          if (!productData || productData.stock === 0) {
            newStatus = 'out_of_stock';
          } else if (productData.stock < itemQuantity) {
            newStatus = 'pending';
          }
          
          if (newStatus !== itemStatus) {
            await supabase
              .from('preorder_items')
              .update({ status: newStatus })
              .eq('id', itemId);
          }
          
          if (newStatus !== 'available') {
            allItemsAvailable = false;
          }
        }
      }
      
      // If all products are available, update order status
      if (allItemsAvailable && order.status !== 'delivered' && order.status !== 'paid') {
        await supabase
          .from('preorders')
          .update({ 
            status: order.paid_amount >= order.total_amount ? 'paid' : 'partial',
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);
      }
      
      if (updatedItems > 0) {
        toast.success(`${updatedItems} produit(s) sont maintenant disponibles`);
      } else if (allItemsAvailable) {
        toast.success("Tous les produits sont disponibles");
      } else {
        toast.info("Certains produits ne sont pas encore disponibles");
      }
      
      refetchPreorders();
    } catch (error) {
      console.error('Error checking stock:', error);
      toast.error("Erreur lors de la vérification du stock");
    } finally {
      setIsUpdating(false);
    }
  };

  return { checkStockAvailability };
}
