
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
        // Get the delivery notes with their relationships
        const { data: deliveryNotesData, error } = await supabase
          .from('delivery_notes')
          .select(`
            id,
            delivery_number,
            created_at,
            updated_at,
            status,
            notes,
            purchase_order_id,
            supplier_id,
            warehouse_id,
            deleted,
            supplier:suppliers (
              id,
              name,
              email,
              phone
            ),
            purchase_order:purchase_orders (
              id,
              order_number,
              total_amount
            )
          `)
          .eq('deleted', false)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching delivery notes:", error);
          throw error;
        }

        console.log("Fetched delivery notes:", deliveryNotesData);
        
        // Then fetch items for each delivery note
        const deliveryNotesWithItems: DeliveryNote[] = [];
        
        for (const noteData of deliveryNotesData || []) {
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
            .eq('delivery_note_id', noteData.id);
            
          if (itemsError) {
            console.error("Error fetching delivery note items:", itemsError);
            // Continue with empty items array instead of throwing
          }
          
          // Transform the data to match our TypeScript interfaces
          const transformedNote: DeliveryNote = {
            id: noteData.id,
            delivery_number: noteData.delivery_number,
            created_at: noteData.created_at,
            updated_at: noteData.updated_at,
            status: noteData.status,
            notes: noteData.notes,
            purchase_order_id: noteData.purchase_order_id,
            supplier_id: noteData.supplier_id,
            warehouse_id: noteData.warehouse_id,
            deleted: noteData.deleted,
            supplier: noteData.supplier ? {
              id: noteData.supplier.id,
              name: noteData.supplier.name,
              email: noteData.supplier.email,
              phone: noteData.supplier.phone
            } : undefined,
            purchase_order: noteData.purchase_order ? {
              id: noteData.purchase_order.id,
              order_number: noteData.purchase_order.order_number,
              total_amount: noteData.purchase_order.total_amount
            } : undefined,
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
          
          console.log(`Delivery note ${noteData.delivery_number} has ${transformedNote.items.length} items`);
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
