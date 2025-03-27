
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      
      // Vérifier chaque produit
      for (const item of order.items) {
        // Vérifier stock disponible
        const { data: productData } = await supabase
          .from('catalog')
          .select('stock')
          .eq('id', item.product_id)
          .single();
          
        if (productData && productData.stock >= item.quantity) {
          // Stock disponible, mettre à jour le statut de l'article
          if (item.status !== 'available') {
            const { error } = await supabase
              .from('preorder_items')
              .update({ status: 'available' })
              .eq('id', item.id);
              
            if (!error) updatedItems++;
          }
        } else {
          // Mettre à jour le statut si le produit est en rupture
          let newStatus = item.status;
          if (!productData || productData.stock === 0) {
            newStatus = 'out_of_stock';
          } else if (productData.stock < item.quantity) {
            newStatus = 'pending';
          }
          
          if (newStatus !== item.status) {
            await supabase
              .from('preorder_items')
              .update({ status: newStatus })
              .eq('id', item.id);
          }
          
          if (newStatus !== 'available') {
            allItemsAvailable = false;
          }
        }
      }
      
      // Si tous les produits sont disponibles, mettre à jour le statut de la commande
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
