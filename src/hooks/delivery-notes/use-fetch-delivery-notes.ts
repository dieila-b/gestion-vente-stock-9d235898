
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DeliveryNote } from "@/types/delivery-note";

/**
 * Hook to fetch delivery notes from the database with their items
 */
export function useFetchDeliveryNotes() {
  return useQuery({
    queryKey: ['delivery-notes'],
    queryFn: async () => {
      console.log("Fetching delivery notes with items...");
      try {
        // First get the delivery notes
        const { data: deliveryNotesData, error } = await supabase
          .rpc('bypass_select_delivery_notes');

        if (error) {
          console.error("Error fetching delivery notes:", error);
          throw error;
        }

        console.log("Fetched delivery notes:", deliveryNotesData);
        
        // Then fetch items for each delivery note
        const deliveryNotesWithItems: DeliveryNote[] = [];
        
        for (const noteData of deliveryNotesData || []) {
          // Cast the Json data to a proper object
          const note = noteData as any;
          
          // Fetch items for this delivery note
          const { data: itemsData, error: itemsError } = await supabase
            .from('delivery_note_items')
            .select(`
              id,
              delivery_note_id,
              product_id,
              quantity_ordered,
              quantity_received,
              unit_price,
              product:catalog(
                id,
                name,
                reference
              )
            `)
            .eq('delivery_note_id', note.id);
            
          if (itemsError) {
            console.error("Error fetching delivery note items:", itemsError);
            // Continue with empty items array instead of throwing
          }
          
          // Transform the data to match our TypeScript interfaces
          const transformedNote: DeliveryNote = {
            id: note.id,
            delivery_number: note.delivery_number,
            created_at: note.created_at,
            updated_at: note.updated_at,
            status: note.status,
            notes: note.notes,
            purchase_order_id: note.purchase_order_id,
            supplier_id: note.supplier_id,
            warehouse_id: note.warehouse_id,
            deleted: note.deleted,
            supplier: note.supplier,
            purchase_order: note.purchase_order,
            items: itemsData?.map(item => ({
              id: item.id,
              delivery_note_id: item.delivery_note_id,
              product_id: item.product_id,
              quantity_ordered: item.quantity_ordered,
              quantity_received: item.quantity_received,
              unit_price: item.unit_price,
              product: item.product ? {
                id: item.product.id,
                name: item.product.name,
                reference: item.product.reference
              } : undefined
            })) || []
          };
          
          deliveryNotesWithItems.push(transformedNote);
        }
        
        console.log("Transformed delivery notes with items:", deliveryNotesWithItems);
        return deliveryNotesWithItems;
      } catch (error) {
        console.error("Error fetching delivery notes:", error);
        return [];
      }
    },
    staleTime: 1000 * 30, // 30 secondes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}
