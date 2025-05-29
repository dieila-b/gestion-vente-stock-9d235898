
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

        console.log("Fetched delivery notes:", deliveryNotesData?.length || 0, "records");
        
        if (!deliveryNotesData || deliveryNotesData.length === 0) {
          console.log("No delivery notes found");
          return [];
        }
        
        // Fetch items for all delivery notes in one query
        const deliveryNoteIds = deliveryNotesData.map(note => note.id);
        const { data: allItemsData, error: itemsError } = await supabase
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
          .in('delivery_note_id', deliveryNoteIds);
          
        if (itemsError) {
          console.error("Error fetching delivery note items:", itemsError);
          // Continue without items instead of throwing
        }
        
        // Group items by delivery note ID
        const itemsByDeliveryNote: Record<string, any[]> = {};
        if (allItemsData) {
          allItemsData.forEach(item => {
            if (!itemsByDeliveryNote[item.delivery_note_id]) {
              itemsByDeliveryNote[item.delivery_note_id] = [];
            }
            itemsByDeliveryNote[item.delivery_note_id].push(item);
          });
        }
        
        // Transform the data to match our TypeScript interfaces
        const transformedNotes: DeliveryNote[] = deliveryNotesData.map(noteData => {
          const items = itemsByDeliveryNote[noteData.id] || [];
          
          return {
            id: noteData.id,
            delivery_number: noteData.delivery_number || `BL-${noteData.id.slice(0, 8)}`,
            created_at: noteData.created_at,
            updated_at: noteData.updated_at,
            status: noteData.status || 'pending',
            notes: noteData.notes || '',
            purchase_order_id: noteData.purchase_order_id,
            supplier_id: noteData.supplier_id,
            warehouse_id: noteData.warehouse_id,
            deleted: noteData.deleted || false,
            supplier: noteData.supplier ? {
              id: noteData.supplier.id,
              name: noteData.supplier.name || 'Fournisseur inconnu',
              email: noteData.supplier.email,
              phone: noteData.supplier.phone
            } : undefined,
            purchase_order: noteData.purchase_order ? {
              id: noteData.purchase_order.id,
              order_number: noteData.purchase_order.order_number || 'N/A',
              total_amount: noteData.purchase_order.total_amount || 0
            } : undefined,
            items: items.map(item => ({
              id: item.id,
              delivery_note_id: item.delivery_note_id,
              product_id: item.product_id,
              quantity_ordered: item.quantity_ordered || 0,
              quantity_received: item.quantity_received || 0,
              unit_price: item.unit_price || 0,
              product: item.product ? {
                id: item.product.id,
                name: item.product.name || 'Produit inconnu',
                reference: item.product.reference || ''
              } : undefined
            }))
          };
        });
        
        console.log("Transformed delivery notes:", transformedNotes.length, "notes with items");
        return transformedNotes;
        
      } catch (error) {
        console.error("Error in delivery notes query:", error);
        // Return empty array instead of throwing to prevent UI crashes
        return [];
      }
    },
    staleTime: 1000 * 30, // 30 secondes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}
