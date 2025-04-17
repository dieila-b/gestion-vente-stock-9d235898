
import { useQuery } from "@tanstack/react-query";
import { DeliveryNote } from "@/types/delivery-note";
import { supabase } from "@/integrations/supabase/client";
import { transformDeliveryNotes } from "./data/transform-delivery-notes";
import { syncApprovedPurchaseOrders } from "./sync/sync-approved-purchase-orders";

/**
 * Hook to fetch delivery notes from the database.
 * Also triggers synchronization of approved purchase orders to create delivery notes.
 */
export function useFetchDeliveryNotes() {
  return useQuery({
    queryKey: ['delivery-notes'],
    queryFn: async () => {
      console.log("Fetching delivery notes...");
      try {
        // Fetch delivery notes directly from Supabase for more reliable results
        const { data: deliveryNotesData, error } = await supabase
          .from('delivery_notes')
          .select(`
            id,
            delivery_number,
            created_at,
            updated_at,
            notes,
            status,
            purchase_order_id,
            supplier_id,
            supplier:suppliers (
              id,
              name,
              phone,
              email
            ),
            purchase_order:purchase_orders (
              id,
              order_number,
              total_amount
            ),
            items:delivery_note_items (
              id,
              product_id,
              quantity_ordered,
              quantity_received,
              unit_price,
              product:catalog (
                id,
                name,
                reference
              )
            )
          `)
          .eq('deleted', false)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching delivery notes:", error);
          return [];
        }

        console.log("Fetched delivery notes:", deliveryNotesData);
        
        // Transform and clean up the data
        const deliveryNotes = transformDeliveryNotes(deliveryNotesData);
        
        console.log("Transformed delivery notes:", deliveryNotes);
        
        // Après avoir récupéré les bons de livraison existants, vérifions s'il existe des commandes approuvées
        // qui n'ont pas encore de bons de livraison, et créons-les si nécessaire
        await syncApprovedPurchaseOrders();
        
        // Une fois la synchronisation terminée, récupérons à nouveau les bons de livraison
        // pour inclure ceux nouvellement créés
        if (deliveryNotes.length === 0) {
          const { data: refreshedData, error: refreshError } = await supabase
            .from('delivery_notes')
            .select(`
              id,
              delivery_number,
              created_at,
              updated_at,
              notes,
              status,
              purchase_order_id,
              supplier_id,
              supplier:suppliers (
                id,
                name,
                phone,
                email
              ),
              purchase_order:purchase_orders (
                id,
                order_number,
                total_amount
              ),
              items:delivery_note_items (
                id,
                product_id,
                quantity_ordered,
                quantity_received,
                unit_price,
                product:catalog (
                  id,
                  name,
                  reference
                )
              )
            `)
            .eq('deleted', false)
            .order('created_at', { ascending: false });
          
          if (!refreshError && refreshedData && refreshedData.length > 0) {
            console.log("Fetched refreshed delivery notes after sync:", refreshedData);
            return transformDeliveryNotes(refreshedData);
          }
        }
        
        return deliveryNotes;
      } catch (error) {
        console.error("Error fetching delivery notes:", error);
        return [];
      }
    }
  });
}
