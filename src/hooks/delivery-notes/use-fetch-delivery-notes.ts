
import { useQuery } from "@tanstack/react-query";
import { DeliveryNote } from "@/types/delivery-note";
import { db } from "@/utils/db-core";
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
        // First sync approved purchase orders to create any missing delivery notes
        console.log("Syncing approved purchase orders before fetching delivery notes...");
        await syncApprovedPurchaseOrders();
        
        // Then fetch all delivery notes using our db utility for more reliable results
        const deliveryNotesData = await db.query(
          'delivery_notes',
          q => q.select(`
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
          .order('created_at', { ascending: false }),
          []
        );

        console.log("Fetched delivery notes:", deliveryNotesData);
        
        // Transform and clean up the data
        const deliveryNotes = transformDeliveryNotes(deliveryNotesData);
        
        console.log("Transformed delivery notes:", deliveryNotes);
        return deliveryNotes;
      } catch (error) {
        console.error("Error fetching delivery notes:", error);
        return [];
      }
    }
  });
}
